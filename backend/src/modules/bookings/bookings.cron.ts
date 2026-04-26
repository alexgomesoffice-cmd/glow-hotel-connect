/**
 * FILE: src/modules/bookings/bookings.cron.ts
 * PURPOSE: Scheduled cron jobs for booking management
 *
 * WHAT IT DOES:
 * - Runs every 5 minutes to find and expire RESERVED bookings past their reserved_until time
 * - Updates both bookings and room_booking_trackers status to EXPIRED
 * - Frees up rooms for other users
 *
 * WHY:
 * Users have 30 mins to complete payment after reservation
 * After 30 mins, room should be freed if not paid
 * This job automates that process
 *
 * USAGE:
 * import { initBookingCrons } from './bookings.cron';
 * initBookingCrons();
 */

import cron from "node-cron";
import { prisma } from "@/config/prisma";
import { logger } from "@/utils/logger";
import { TrackerStatus, BookingStatus } from "@prisma/client";

/**
 * Expires all RESERVED bookings that have passed their reserved_until time
 *
 * WORKFLOW:
 * 1. Find all RESERVED bookings where reserved_until < NOW()
 * 2. In transaction:
 *    a. Update bookings status to EXPIRED
 *    b. Update all related room_booking_trackers to EXPIRED
 * 3. Log results
 *
 * IMPORTANT:
 * - Only expires RESERVED bookings (others shouldn't have reserved_until)
 * - Only changes status, doesn't delete anything
 * - Trackers are updated in same transaction for consistency
 *
 * @returns {Promise<void>}
 *
 * @example
 * await expireReservations();
 * // Logs: "Found 3 expired reservations, marked as EXPIRED"
 */
export async function expireReservations(): Promise<void> {
  try {
    console.log(`[CRON] Starting expiry check at ${new Date().toISOString()}`);

    // Find all RESERVED bookings that have expired
    const expiredReservations = await prisma.bookings.findMany({
      where: {
        status: "RESERVED" as BookingStatus,
        reserved_until: {
          lt: new Date(), // reserved_until < NOW()
        },
      },
      select: {
        booking_id: true,
        booking_reference: true,
        reserved_until: true,
      },
    });

    console.log(`[CRON] Found ${expiredReservations.length} expired reservations`);

    if (expiredReservations.length === 0) {
      console.log(`[CRON] No expired reservations to process`);
      return;
    }

    // Get booking IDs for tracker update
    const bookingIds = expiredReservations.map((r) => r.booking_id);

    // Update in transaction
    await prisma.$transaction(async (tx) => {
      // 1. Update all expired bookings
      const bookingUpdateResult = await tx.bookings.updateMany({
        where: {
          booking_id: { in: bookingIds },
          status: "RESERVED" as BookingStatus,
        },
        data: {
          status: "EXPIRED" as BookingStatus,
        },
      });

      console.log(
        `[CRON] Updated ${bookingUpdateResult.count} bookings to EXPIRED status`
      );

      // 2. Update all related tracker entries
      const trackerUpdateResult = await tx.room_booking_trackers.updateMany({
        where: {
          booking_id: { in: bookingIds },
          status: "RESERVED" as TrackerStatus,
        },
        data: {
          status: "EXPIRED" as TrackerStatus,
        },
      });

      console.log(
        `[CRON] Updated ${trackerUpdateResult.count} trackers to EXPIRED status`
      );

      // Log expired reservations
      for (const reservation of expiredReservations) {
        console.log(
          `[CRON] Expired reservation: ${reservation.booking_reference} ` +
          `(reserved_until was ${reservation.reserved_until?.toISOString()})`
        );
      }
    });

    console.log(
      `[CRON] Expiry check completed successfully at ${new Date().toISOString()}`
    );
  } catch (error: any) {
    console.error("[CRON] Error during expiry check:", {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });

    logger.error("Booking expiry cron job failed", {
      error: error.message,
      stack: error.stack,
    });
  }
}

/**
 * Initialize all booking-related cron jobs
 *
 * JOBS:
 * - Run expireReservations() every 5 minutes
 *
 * CRON SYNTAX:
 * ┌───────────── second (0 - 59)
 * │ ┌───────────── minute (0 - 59)
 * │ │ ┌───────────── hour (0 - 23)
 * │ │ │ ┌───────────── day of month (1 - 31)
 * │ │ │ │ ┌───────────── month (0 - 11)
 * │ │ │ │ │ ┌───────────── day of week (0 - 6) (0 = Sunday)
 * │ │ │ │ │ │
 * │ │ │ │ │ │
 * * * * * * *
 *
 * SCHEDULE: Every 5 minutes
 *
 * USAGE:
 * import { initBookingCrons } from './bookings.cron';
 * // Call this in server.ts after app startup
 * initBookingCrons();
 *
 * @returns {void}
 *
 * @example
 * initBookingCrons();
 * // Logs: "✅ Booking cron jobs initialized"
 */
export function initBookingCrons(): void {
  try {
    console.log(`[CRON] Initializing booking cron jobs...`);

    // Schedule expiry check every 5 minutes
    cron.schedule("*/5 * * * *", async () => {
      console.log(`[CRON] Running scheduled expiry check`);
      await expireReservations();
    });

    console.log(
      `[CRON] ✅ Booking cron jobs initialized (expiry check: every 5 minutes)`
    );
  } catch (error: any) {
    console.error("[CRON] Failed to initialize cron jobs:", {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });

    logger.error("Failed to initialize booking crons", {
      error: error.message,
      stack: error.stack,
    });
  }
}
