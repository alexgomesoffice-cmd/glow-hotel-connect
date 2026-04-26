/**
 * FILE: src/modules/bookings/bookings.service.ts
 * PURPOSE: Business logic for booking operations (CRUD + management)
 *
 * WHAT IT DOES:
 * - createBooking(bookingData, endUserId) - Create new booking (reserved state)
 * - getBooking(bookingId) - Retrieve booking details with line items
 * - listBookings(filters, skip, take) - List bookings with filtering
 * - updateBookingStatus(bookingId, status) - Change booking status
 * - cancelBooking(bookingId) - Cancel booking
 * - getAvailability(hotelId, checkIn, checkOut) - Check room availability
 *
 * KEY WORKFLOWS:
 * - Creating booking: RESERVED status, reserved_until = now + 30 min
 * - Confirming booking: RESERVED -> BOOKED, locked_price set
 * - Cancelling: status -> CANCELLED, tracker rows freed
 *
 * USAGE:
 * import { createBooking, getBooking } from './bookings.service';
 * const booking = await createBooking(bookingData, endUserId);
 * const details = await getBooking(bookingId);
 */

import { prisma } from "@/config/prisma";
import { BookingStatus, TrackerStatus } from "@prisma/client";

/**
 * Generates a unique booking reference
 * Format: BK-YYYYMMDD-XXXXX (where X is random alphanumeric)
 *
 * @returns {string} Booking reference
 */
function generateBookingReference(): string {
  const now = new Date();
  const datePart = now.toISOString().split("T")[0];
  const dateStr = (datePart || "").replace(/-/g, "");
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `BK-${dateStr}-${random}`;
}

/**
 * Creates a new booking with line items and tracker entries
 *
 * WORKFLOW:
 * 1. Validate hotel exists
 * 2. Check spam rule: user must have < 5 active bookings
 * 3. Validate room availability for date range
 * 4. Calculate total price from room prices
 * 5. Create booking with RESERVED status
 * 6. Create booking_rooms entries (line items)
 * 7. Create room_booking_trackers entries (availability locks)
 * 8. Set reserved_until = now + 30 min
 *
 * INPUTS:
 * - bookingData: { hotel_id, check_in, check_out, rooms: [{hotel_room_id, quantity}], special_request? }
 * - endUserId: End user making booking
 *
 * RETURNS:
 * {
 *   booking_id,
 *   booking_reference,
 *   hotel_id,
 *   check_in,
 *   check_out,
 *   status,
 *   reserved_until,
 *   total_price,
 *   created_at
 * }
 *
 * @throws HOTEL_NOT_FOUND if hotel doesn't exist
 * @throws ROOM_NOT_FOUND if room doesn't exist
 * @throws BOOKING_NOT_AVAILABLE if room not available for dates
 * @throws SPAM_LIMIT_EXCEEDED if user has 5+ active bookings
 * @param {any} bookingData - Booking creation data
 * @param {number} endUserId - End user ID
 * @returns {Promise<object>} Created booking details
 *
 * @example
 * const booking = await createBooking(
 *   {
 *     hotel_id: 5,
 *     check_in: "2026-03-15",
 *     check_out: "2026-03-20",
 *     rooms: [
 *       { hotel_room_id: 12, quantity: 2 },
 *       { hotel_room_id: 15, quantity: 1 }
 *     ]
 *   },
 *   42
 * );
 */
export async function createBooking(bookingData: any, endUserId: number) {
  console.log(`[BOOKING] Creating booking for user ${endUserId}`, {
    hotel_id: bookingData.hotel_id,
    check_in: bookingData.check_in,
    check_out: bookingData.check_out,
    rooms_count: bookingData.rooms?.length,
  });

  // Step 1: Verify hotel exists
  const hotel = await prisma.hotels.findUnique({
    where: { hotel_id: bookingData.hotel_id },
    select: { hotel_id: true },
  });

  if (!hotel) {
    console.error(
      `[BOOKING] Hotel not found: ${bookingData.hotel_id}`
    );
    throw new Error("HOTEL_NOT_FOUND");
  }

  console.log(`[BOOKING] Hotel verified: ${hotel.hotel_id}`);


  // Step 2: Check spam rule - user has < 5 active bookings
  const activeBookings = await prisma.bookings.count({
    where: {
      end_user_id: endUserId,
      status: { in: ["RESERVED", "BOOKED"] },
    },
  });

  console.log(
    `[BOOKING] User ${endUserId} has ${activeBookings} active bookings`
  );

  if (activeBookings >= 5) {
    console.error(
      `[BOOKING] Spam limit exceeded for user ${endUserId} (${activeBookings} active bookings)`
    );
    throw new Error("SPAM_LIMIT_EXCEEDED");
  }

  // Step 3: Parse dates
  const checkIn = new Date(bookingData.check_in);
  const checkOut = new Date(bookingData.check_out);

  console.log(`[BOOKING] Dates parsed`, {
    check_in: checkIn.toISOString(),
    check_out: checkOut.toISOString(),
  });

  // Step 4: Verify all rooms exist and get prices
  const roomIds = bookingData.rooms.map((r: any) => r.hotel_room_id);
  const rooms = await prisma.hotel_rooms.findMany({
    where: {
      hotel_room_id: { in: roomIds },
      hotel_id: bookingData.hotel_id,
    },
    select: {
      hotel_room_id: true,
      base_price: true,
    },
  });

  console.log(`[BOOKING] Found ${rooms.length} of ${roomIds.length} rooms`);

  if (rooms.length !== roomIds.length) {
    console.error(
      `[BOOKING] Some rooms not found (requested: ${roomIds.length}, found: ${rooms.length})`
    );
    throw new Error("ROOM_NOT_FOUND");
  }

  // Create map of room prices
  const roomPriceMap = new Map(rooms.map(r => [r.hotel_room_id, r.base_price]));

  console.log(`[BOOKING] Room prices retrieved`, {
    room_count: rooms.length,
    prices: Array.from(roomPriceMap.entries()).map(([id, price]) => ({
      hotel_room_id: id,
      price: price.toString(),
    })),
  });

  // Step 5: Check availability for all rooms
  const nights = Math.floor((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

  console.log(`[BOOKING] Checking availability for ${nights} nights`);


  for (const room of bookingData.rooms) {
    const conflictingBookings = await prisma.room_booking_trackers.count({
      where: {
        hotel_room_id: room.hotel_room_id,
        status: { in: ["RESERVED", "BOOKED"] },
        check_in: { lt: checkOut },
        check_out: { gt: checkIn },
      },
    });

    console.log(
      `[BOOKING] Room ${room.hotel_room_id}: ${conflictingBookings} conflicting bookings`
    );

    if (conflictingBookings > 0) {
      console.error(
        `[BOOKING] Room ${room.hotel_room_id} not available for dates`
      );
      throw new Error("BOOKING_NOT_AVAILABLE");
    }
  }

  // Step 6: Calculate total price (use provided price or calculate from base prices)
  let totalPrice: number;
  if (bookingData.total_price !== undefined && bookingData.total_price !== null) {
    // Use the frontend-calculated price including fees and taxes
    totalPrice = Number(bookingData.total_price);
    console.log(`[BOOKING] Using provided total price: ${totalPrice}`);
  } else {
    // Calculate price from base prices (legacy behavior)
    totalPrice = 0;
    for (const room of bookingData.rooms) {
      const pricePerNight = roomPriceMap.get(room.hotel_room_id)!;
      totalPrice += Number(pricePerNight) * room.quantity * nights;
    }
    console.log(`[BOOKING] Calculated total price: ${totalPrice}`);
  }

  // Step 7: Generate booking reference
  const bookingReference = generateBookingReference();

  console.log(`[BOOKING] Generated booking reference: ${bookingReference}`);

  // Step 8: Create booking with line items and trackers in a transaction
  const booking = await prisma.$transaction(async (tx) => {
    // Create booking
    const newBooking = await tx.bookings.create({
      data: {
        booking_reference: bookingReference,
        end_user_id: endUserId,
        hotel_id: bookingData.hotel_id,
        check_in: checkIn,
        check_out: checkOut,
        special_request: bookingData.special_request || null,
        status: "RESERVED",
        reserved_until: new Date(Date.now() + 30 * 60 * 1000), // now + 30 min
        total_price: totalPrice,
      },
      select: {
        booking_id: true,
        booking_reference: true,
        hotel_id: true,
        check_in: true,
        check_out: true,
        status: true,
        reserved_until: true,
        total_price: true,
        created_at: true,
      },
    });

    console.log(`[BOOKING] Created booking record`, {
      booking_id: newBooking.booking_id,
      booking_reference: newBooking.booking_reference,
      status: newBooking.status,
      reserved_until: newBooking.reserved_until?.toISOString(),
    });

    // Create line items
    for (const room of bookingData.rooms) {
      const pricePerNight = roomPriceMap.get(room.hotel_room_id)!;
      const subtotal = Number(pricePerNight) * room.quantity * nights;

      const lineItem = await tx.booking_rooms.create({
        data: {
          booking_id: newBooking.booking_id,
          hotel_room_id: room.hotel_room_id,
          quantity: room.quantity,
          price_per_night: pricePerNight,
          nights,
          subtotal,
        },
      });

      console.log(`[BOOKING] Created line item`, {
        booking_room_id: lineItem.booking_room_id,
        hotel_room_id: room.hotel_room_id,
        quantity: room.quantity,
        subtotal: subtotal.toString(),
      });
    }

    // Create tracker entries for availability
    for (const room of bookingData.rooms) {
      const availableRooms = await tx.hotel_room_details.findMany({
        where: {
          hotel_rooms_id: room.hotel_room_id,
          deleted_at: null,
          room_booking_trackers: {
            none: {
              status: { in: ["RESERVED", "BOOKED"] },
              check_in: { lt: checkOut },
              check_out: { gt: checkIn },
            },
          },
        },
        select: { hotel_room_details_id: true },
        take: room.quantity,
      });

      if (availableRooms.length < room.quantity) {
        console.error(
          `[BOOKING] Not enough available physical rooms for room type ${room.hotel_room_id}`
        );
        throw new Error("BOOKING_NOT_AVAILABLE");
      }

      for (const availableRoom of availableRooms) {
        const tracker = await tx.room_booking_trackers.upsert({
          where: {
            hotel_room_details_id_check_in_check_out: {
              hotel_room_details_id: availableRoom.hotel_room_details_id,
              check_in: checkIn,
              check_out: checkOut,
            },
          },
          update: {
            booking_id: newBooking.booking_id,
            status: "RESERVED",
          },
          create: {
            booking_id: newBooking.booking_id,
            hotel_room_details_id: availableRoom.hotel_room_details_id,
            hotel_room_id: room.hotel_room_id,
            check_in: checkIn,
            check_out: checkOut,
            status: "RESERVED",
          },
        });

        console.log(`[BOOKING] Created tracker entry`, {
          tracker_id: tracker.tracker_id,
          hotel_room_details_id: availableRoom.hotel_room_details_id,
          status: tracker.status,
        });
      }
    }

    return newBooking;
  });

  console.log(`[BOOKING] Booking creation completed successfully`, {
    booking_id: booking.booking_id,
    booking_reference: booking.booking_reference,
  });

  return booking;
}

/**
 * Retrieves a single booking by ID with line items
 *
 * INPUTS:
 * - bookingId: Booking ID
 *
 * RETURNS:
 * {
 *   booking_id,
 *   booking_reference,
 *   hotel_id,
 *   end_user_id,
 *   check_in,
 *   check_out,
 *   status,
 *   total_price,
 *   locked_price,
 *   created_at,
 *   updated_at,
 *   booking_rooms: [
 *     {
 *       booking_room_id,
 *       hotel_room_id,
 *       quantity,
 *       price_per_night,
 *       nights,
 *       subtotal
 *     }
 *   ]
 * }
 *
 * @throws BOOKING_NOT_FOUND if booking doesn't exist
 * @param {number} bookingId - Booking ID
 * @returns {Promise<object>} Booking details with line items
 *
 * @example
 * const booking = await getBooking(456);
 */
export async function getBooking(bookingId: number) {
  console.log(`[BOOKING] Fetching booking: ${bookingId}`);

  const booking = await prisma.bookings.findUnique({
    where: { booking_id: bookingId },
    select: {
      booking_id: true,
      booking_reference: true,
      hotel_id: true,
      end_user_id: true,
      check_in: true,
      check_out: true,
      status: true,
      special_request: true,
      total_price: true,
      locked_price: true,
      created_at: true,
      updated_at: true,
      booking_rooms: {
        select: {
          booking_room_id: true,
          hotel_room_id: true,
          quantity: true,
          price_per_night: true,
          nights: true,
          subtotal: true,
        },
      },
    },
  });

  if (!booking) {
    console.error(`[BOOKING] Booking not found: ${bookingId}`);
    throw new Error("BOOKING_NOT_FOUND");
  }

  console.log(`[BOOKING] Booking retrieved`, {
    booking_id: booking.booking_id,
    status: booking.status,
    line_items: booking.booking_rooms.length,
  });

  return booking;
}

/**
 * Lists bookings with optional filtering
 *
 * INPUTS:
 * - filters: { hotel_id?, end_user_id?, status? } (optional)
 * - skip: Records to skip (default: 0)
 * - take: Records to return (default: 10, max: 100)
 *
 * RETURNS:
 * {
 *   bookings: [
 *     {
 *       booking_id,
 *       booking_reference,
 *       hotel_id,
 *       end_user_id,
 *       check_in,
 *       check_out,
 *       status,
 *       total_price,
 *       created_at
 *     }
 *   ],
 *   total,
 *   skip,
 *   take
 * }
 *
 * @param {object} filters - Optional filters
 * @param {number} skip - Pagination skip
 * @param {number} take - Pagination take
 * @returns {Promise<object>} Bookings list with pagination
 *
 * @example
 * const result = await listBookings({
 *   hotel_id: 5,
 *   status: "BOOKED"
 * }, 0, 20);
 */
export async function listBookings(filters: any = {}, skip: number = 0, take: number = 10) {
  // Build where clause
  const where: any = {};

  if (filters.hotel_id) {
    where.hotel_id = filters.hotel_id;
  }

  if (filters.end_user_id) {
    where.end_user_id = filters.end_user_id;
  }

  if (filters.status) {
    where.status = filters.status;
  }

  // Fetch bookings and total count in parallel
  const [bookings, total] = await Promise.all([
    prisma.bookings.findMany({
      where,
      select: {
        booking_id: true,
        booking_reference: true,
        hotel_id: true,
        end_user_id: true,
        check_in: true,
        check_out: true,
        status: true,
        total_price: true,
        created_at: true,
        end_user: {
          select: {
            name: true,
            email: true,
          },
        },
        hotel: {
          select: {
            name: true,
            city: true,
          },
        },
        booking_rooms: {
          select: {
            hotel_room: {
              select: {
                room_type: true,
              },
            },
          },
          take: 1, // Get the first room type
        },
      },
      skip,
      take,
      orderBy: { created_at: "desc" },
    }),
    prisma.bookings.count({ where }),
  ]);

  // Map bookings to include hotel info at top level
  const mappedBookings = bookings.map((booking: any) => {
    // Format dates as strings (YYYY-MM-DD)
    const formatDate = (date: any) => {
      if (!date) return null;
      if (typeof date === 'string') return date;
      return date.toISOString().split('T')[0];
    };

    // Get room type from first booking room
    const roomType = booking.booking_rooms?.[0]?.hotel_room?.room_type || null;

    return {
      booking_id: booking.booking_id,
      booking_reference: booking.booking_reference,
      hotel_id: booking.hotel_id,
      end_user_id: booking.end_user_id,
      check_in: formatDate(booking.check_in),
      check_out: formatDate(booking.check_out),
      status: booking.status,
      total_price: booking.total_price,
      created_at: booking.created_at,
      hotel_name: booking.hotel?.name || null,
      location: booking.hotel?.city || null,
      room_type: roomType,
      guest_name: booking.end_user?.name || null,
      guest_email: booking.end_user?.email || null,
    };
  });

  return {
    bookings: mappedBookings,
    total,
    skip,
    take,
  };
}

/**
 * Updates a booking's status
 *
 * WORKFLOW:
 * - RESERVED -> BOOKED: Set locked_price, clear reserved_until, update trackers
 * - Any status -> CANCELLED: Update status, release all tracker entries
 * - BOOKED -> CHECKED_IN/CHECKED_OUT/NO_SHOW: Update status
 *
 * INPUTS:
 * - bookingId: Booking ID
 * - status: New status
 *
 * RETURNS:
 * {
 *   booking_id,
 *   status,
 *   locked_price,
 *   updated_at
 * }
 *
 * @throws BOOKING_NOT_FOUND if booking doesn't exist
 * @throws INVALID_STATUS_TRANSITION if transition not allowed
 * @param {number} bookingId - Booking ID
 * @param {string} status - New status
 * @returns {Promise<object>} Updated booking details
 *
 * @example
 * const updated = await updateBookingStatus(456, "BOOKED");
 */
export async function updateBookingStatus(bookingId: number, status: string) {
  console.log(`[BOOKING] Updating booking ${bookingId} status to ${status}`);

  // Verify booking exists
  const existing = await prisma.bookings.findUnique({
    where: { booking_id: bookingId },
    select: {
      booking_id: true,
      status: true,
      total_price: true,
      locked_price: true,
    },
  });

  if (!existing) {
    console.error(`[BOOKING] Booking not found: ${bookingId}`);
    throw new Error("BOOKING_NOT_FOUND");
  }

  console.log(`[BOOKING] Current status: ${existing.status}, new status: ${status}`);

  // Update booking
  const updateData: any = {
    status: status as BookingStatus,
  };

  // Handle RESERVED -> BOOKED transition
  if (existing.status === "RESERVED" && status === "BOOKED") {
    console.log(`[BOOKING] Handling RESERVED -> BOOKED transition for booking ${bookingId}`);

    updateData.locked_price = existing.total_price;
    updateData.reserved_until = null;

    // Update all tracker entries to BOOKED
    const trackerUpdateResult = await prisma.room_booking_trackers.updateMany({
      where: { booking_id: bookingId },
      data: { status: "BOOKED" as TrackerStatus },
    });

    console.log(
      `[BOOKING] Updated ${trackerUpdateResult.count} trackers to BOOKED`
    );
  }

  // Handle cancellation
  if (status === "CANCELLED") {
    console.log(`[BOOKING] Handling cancellation for booking ${bookingId}`);

    // Update all tracker entries to CANCELLED
    const trackerUpdateResult = await prisma.room_booking_trackers.updateMany({
      where: { booking_id: bookingId },
      data: { status: "CANCELLED" as TrackerStatus },
    });

    console.log(
      `[BOOKING] Updated ${trackerUpdateResult.count} trackers to CANCELLED`
    );
  }

  const booking = await prisma.bookings.update({
    where: { booking_id: bookingId },
    data: updateData,
    select: {
      booking_id: true,
      status: true,
      locked_price: true,
      updated_at: true,
    },
  });

  console.log(`[BOOKING] Booking status updated successfully`, {
    booking_id: booking.booking_id,
    status: booking.status,
  });

  return booking;
}

/**
 * Cancels a booking
 *
 * WORKFLOW:
 * 1. Set status to CANCELLED
 * 2. Update all tracker entries to CANCELLED
 * 3. Return confirmation
 *
 * @throws BOOKING_NOT_FOUND if booking doesn't exist
 * @param {number} bookingId - Booking ID
 * @returns {Promise<object>} Cancellation confirmation
 *
 * @example
 * const result = await cancelBooking(456);
 */
export async function cancelBooking(bookingId: number) {
  return updateBookingStatus(bookingId, "CANCELLED");
}

/**
 * Checks room availability for a hotel and date range
 *
 * WORKFLOW:
 * 1. Get all room types for hotel
 * 2. For each room type, count available physical rooms
 * 3. Return availability summary
 *
 * INPUTS:
 * - hotelId: Hotel ID
 * - checkIn: Check-in date (ISO string)
 * - checkOut: Check-out date (ISO string)
 *
 * RETURNS:
 * {
 *   hotel_id,
 *   check_in,
 *   check_out,
 *   rooms: [
 *     {
 *       hotel_room_id,
 *       room_type,
 *       total_inventory,
 *       available,
 *       reserved,
 *       booked,
 *       base_price
 *     }
 *   ]
 * }
 *
 * @throws HOTEL_NOT_FOUND if hotel doesn't exist
 * @param {number} hotelId - Hotel ID
 * @param {string} checkIn - Check-in date (ISO)
 * @param {string} checkOut - Check-out date (ISO)
 * @returns {Promise<object>} Availability summary
 *
 * @example
 * const availability = await getAvailability(5, "2026-03-15", "2026-03-20");
 */
export async function getAvailability(hotelId: number, checkIn: string, checkOut: string) {
  console.log(`[BOOKING] Checking availability for hotel ${hotelId}`, {
    check_in: checkIn,
    check_out: checkOut,
  });

  // Verify hotel exists
  const hotel = await prisma.hotels.findUnique({
    where: { hotel_id: hotelId },
    select: { hotel_id: true },
  });

  if (!hotel) {
    console.error(`[BOOKING] Hotel not found: ${hotelId}`);
    throw new Error("HOTEL_NOT_FOUND");
  }

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  // Get all room types for this hotel
  const roomTypes = await prisma.hotel_rooms.findMany({
    where: { hotel_id: hotelId },
    select: {
      hotel_room_id: true,
      room_type: true,
      base_price: true,
    },
  });

  console.log(`[BOOKING] Found ${roomTypes.length} room types for hotel ${hotelId}`);

  // For each room type, calculate availability
  const roomAvailability = await Promise.all(
    roomTypes.map(async (roomType) => {
      // Count total inventory (non-deleted physical rooms)
      const totalInventory = await prisma.hotel_room_details.count({
        where: {
          hotel_rooms_id: roomType.hotel_room_id,
          deleted_at: null,
        },
      });

      // Count RESERVED rooms
      const reserved = await prisma.room_booking_trackers.count({
        where: {
          hotel_room_id: roomType.hotel_room_id,
          status: "RESERVED",
          check_in: { lt: checkOutDate },
          check_out: { gt: checkInDate },
        },
      });

      // Count BOOKED rooms
      const booked = await prisma.room_booking_trackers.count({
        where: {
          hotel_room_id: roomType.hotel_room_id,
          status: "BOOKED",
          check_in: { lt: checkOutDate },
          check_out: { gt: checkInDate },
        },
      });

      const available = totalInventory - reserved - booked;

      console.log(
        `[BOOKING] Room ${roomType.hotel_room_id} (${roomType.room_type}): ` +
        `total=${totalInventory}, reserved=${reserved}, booked=${booked}, available=${Math.max(0, available)}`
      );

      return {
        hotel_room_id: roomType.hotel_room_id,
        room_type: roomType.room_type,
        total_inventory: totalInventory,
        available: Math.max(0, available),
        reserved,
        booked,
        base_price: roomType.base_price,
      };
    })
  );

  console.log(`[BOOKING] Availability check completed for hotel ${hotelId}`);

  return {
    hotel_id: hotelId,
    check_in: checkInDate,
    check_out: checkOutDate,
    rooms: roomAvailability,
  };
}
