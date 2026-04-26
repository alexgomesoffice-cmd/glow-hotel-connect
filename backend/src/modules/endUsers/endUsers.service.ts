
import { Prisma } from "@prisma/client";
import { prisma } from "@/config/prisma";

/**
 * Public hotel search for end users with filters and availability logic
 * Filters: location (city or hotel name), check_in, check_out, guests, rooms
 * Returns hotels sorted by: available > reserved > unavailable
 */
export async function publicHotelSearch(filters: {
  location?: string;
  check_in?: string;
  check_out?: string;
  guests?: number;
  rooms?: number;
}) {
  // Build hotel filter
  const hotelWhere: Prisma.hotelsWhereInput = {
    approval_status: "PUBLISHED",
    deleted_at: null,
  };
  if (filters.location) {
    hotelWhere.OR = [
      { city: { contains: filters.location } },
      { name: { contains: filters.location } },
    ];
  }

  // Get all published hotels matching location
  const hotels = await prisma.hotels.findMany({
    where: hotelWhere,
    include: {
      hotel_details: true,
      hotel_amenities: { include: { amenity: true } },
      hotel_images: true,
      hotel_rooms: {
        // Only include room types that actually have active physical inventory.
        // This prevents brand-new hotels (no rooms yet) from showing room types.
        where: {
          hotel_room_details: {
            some: { deleted_at: null },
          },
        },
        include: {
          hotel_room_images: true,
          hotel_room_details: {
            where: { deleted_at: null },
            select: {
              bed_type: true,
              room_amenities: {
                include: { amenity: true },
              },
            },
          },
        },
      },
    },
  });

  // If no date/room filter, just return all hotels (sorted by name)
  if (!filters.check_in && !filters.check_out && !filters.rooms) {
    return hotels.sort((a, b) => a.name.localeCompare(b.name));
  }

  // Parse dates
  let checkIn: Date | undefined = undefined;
  let checkOut: Date | undefined = undefined;
  if (filters.check_in) checkIn = new Date(filters.check_in);
  if (filters.check_out) checkOut = new Date(filters.check_out);
  const roomsRequested = filters.rooms || 1;

  // Helper: get available/reserved/unavailable status for a hotel
  async function getHotelAvailability(hotel: any) {
    let availableCount = 0;
    let reservedCount = 0;
    let unavailableCount = 0;
    let minPrice: number | null = null;

    // For each room type in hotel
    for (const room of hotel.hotel_rooms) {
      // Count total physical rooms for this type
      const totalPhysicalRooms = await prisma.hotel_room_details.count({
        where: {
          hotel_rooms_id: room.hotel_room_id,
          deleted_at: null,
        },
      });
      if (totalPhysicalRooms === 0) continue;

      // Find booked/reserved rooms for the date range
      let bookedCount = 0;
      let reservedCountForRoom = 0;
      if (checkIn && checkOut) {
        // Find all bookings for this room in the date range
        const bookings = await prisma.bookings.findMany({
          where: {
            hotel_id: hotel.hotel_id,
            status: { in: ["BOOKED", "RESERVED"] },
            check_in: { lt: checkOut },
            check_out: { gt: checkIn },
          },
          include: {
            booking_rooms: true,
          },
        });
        for (const booking of bookings) {
          for (const br of booking.booking_rooms ?? []) {
            if (br.hotel_room_id === room.hotel_room_id) {
              if (booking.status === "BOOKED") bookedCount += br.quantity;
              if (booking.status === "RESERVED") reservedCountForRoom += br.quantity;
            }
          }
        }
      }
      const availableForRoom = totalPhysicalRooms - bookedCount - reservedCountForRoom;
      // If enough available, count as available
      if (availableForRoom >= roomsRequested) {
        availableCount++;
        if (minPrice === null || room.base_price < minPrice) minPrice = room.base_price;
        continue;
      }
      // If enough reserved (but not booked), count as reserved
      if (totalPhysicalRooms - bookedCount >= roomsRequested) {
        reservedCount++;
        if (minPrice === null || room.base_price < minPrice) minPrice = room.base_price;
        continue;
      }
      // Otherwise, unavailable
      unavailableCount++;
    }
    return { availableCount, reservedCount, unavailableCount, minPrice };
  }

  // For each hotel, determine status
  const hotelResults: any[] = [];
  for (const hotel of hotels) {
    const status = await getHotelAvailability(hotel);
    (hotel as any)._availability = status;
    (hotel as any)._sortKey = status.availableCount > 0 ? 0 : status.reservedCount > 0 ? 1 : 2;
    (hotel as any)._minPrice = status.minPrice;
    hotelResults.push(hotel);
  }

  // Sort: available first, then reserved, then unavailable
  hotelResults.sort((a, b) => {
    if (a._sortKey !== b._sortKey) return a._sortKey - b._sortKey;
    // If same, sort by price
    if (a._minPrice !== null && b._minPrice !== null) return a._minPrice - b._minPrice;
    return a.name.localeCompare(b.name);
  });

  // Remove helper fields before returning
  return hotelResults.map(hotel => {
    const { _availability, _sortKey, _minPrice, ...rest } = hotel as any;
    return rest;
  });
}
/**
 * FILE: src/modules/endUsers/endUsers.service.ts
 * PURPOSE: Business logic for end user operations
 *
 * WHAT IT DOES:
 * - listEndUsers(filters, skip, take) - List all end users with pagination
 * - getEndUser(endUserId) - Get single end user details
 * - blockEndUser(endUserId) - Block/unblock end user
 *
 * USAGE:
 * import { listEndUsers, getEndUser } from './endUsers.service';
 * const users = await listEndUsers({}, 0, 10);
 */

// import { prisma } from "@/config/prisma";

/**
 * List all end users with pagination and filtering
 *
 * @param {object} filters - Filtering options (is_blocked, search)
 * @param {number} skip - Records to skip (pagination)
 * @param {number} take - Records to return (pagination)
 * @returns {Promise<object>} { users: [], total, skip, take }
 *
 * @example
 * const result = await listEndUsers({ is_blocked: false }, 0, 20);
 */
export async function listEndUsers(filters: any = {}, skip: number = 0, take: number = 10) {
  // Build where clause
  const where: any = {};

  // Exclude soft-deleted users (deleted_at IS NULL)
  where.deleted_at = null;

  if (filters.is_blocked !== undefined) {
    where.is_blocked = filters.is_blocked === true || filters.is_blocked === "true";
  }

  if (filters.search) {
    where.OR = [
      { email: { contains: filters.search } },
      { name: { contains: filters.search } },
    ];
  }

  // Fetch end users and total count in parallel
  const [endUsers, total] = await Promise.all([
    prisma.end_users.findMany({
      where,
      select: {
        end_user_id: true,
        email: true,
        name: true,
        is_blocked: true,
        email_verified: true,
        last_login_at: true,
        created_at: true,
      },
      skip,
      take,
      orderBy: { created_at: "desc" },
    }),
    prisma.end_users.count({ where }),
  ]);

  return {
    end_users: endUsers,
    total,
    skip,
    take,
  };
}

/**
 * Get single end user by ID
 *
 * @param {number} endUserId - End user ID
 * @returns {Promise<object>} End user with details
 * @throws Error if user not found
 *
 * @example
 * const user = await getEndUser(42);
 */
export async function getEndUser(endUserId: number) {
  const endUser = await prisma.end_users.findUnique({
    where: { end_user_id: endUserId },
    select: {
      end_user_id: true,
      email: true,
      name: true,
      is_blocked: true,
      email_verified: true,
      last_login_at: true,
      login_attempts: true,
      created_at: true,
      updated_at: true,
      end_user_details: true,
    },
  });

  if (!endUser) {
    throw new Error("END_USER_NOT_FOUND");
  }

  return endUser;
}

/**
 * Block or unblock an end user
 *
 * @param {number} endUserId - End user ID
 * @param {boolean} isBlocked - Block status (true = blocked, false = unblocked)
 * @returns {Promise<object>} Updated end user
 * @throws Error if user not found
 *
 * @example
 * await blockEndUser(42, true); // Block user
 * await blockEndUser(42, false); // Unblock user
 */
export async function blockEndUser(endUserId: number, isBlocked: boolean) {
  const endUser = await prisma.end_users.findUnique({
    where: { end_user_id: endUserId },
    select: { end_user_id: true },
  });

  if (!endUser) {
    throw new Error("END_USER_NOT_FOUND");
  }

  const updated = await prisma.end_users.update({
    where: { end_user_id: endUserId },
    data: { is_blocked: isBlocked },
    select: {
      end_user_id: true,
      email: true,
      name: true,
      is_blocked: true,
      updated_at: true,
    },
  });

  return updated;
}

/**
 * Delete an end user (soft delete)
 *
 * @param {number} endUserId - End user ID
 * @returns {Promise<object>} Deletion confirmation
 * @throws Error if user not found
 *
 * @example
 * await deleteEndUser(42); // Soft delete user
 */
export async function deleteEndUser(endUserId: number) {
  const endUser = await prisma.end_users.findUnique({
    where: { end_user_id: endUserId },
    select: { end_user_id: true },
  });

  if (!endUser) {
    throw new Error("END_USER_NOT_FOUND");
  }

  await prisma.end_users.update({
    where: { end_user_id: endUserId },
    data: { deleted_at: new Date() },
  });

  return {
    message: "End user deleted successfully",
    end_user_id: endUserId,
  };
}
