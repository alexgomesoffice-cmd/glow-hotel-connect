/**
 * FILE: src/modules/rooms/rooms.service.ts
 * PURPOSE: Business logic for room operations (CRUD)
 *
 * WHAT IT DOES:
 * - createRoom(roomData, hotelId) - Create new room type for hotel
 * - getRoom(roomId) - Retrieve room type details
 * - listRooms(hotelId, filters, skip, take) - List rooms with filtering
 * - updateRoom(roomId, updates) - Update room type info
 * - deleteRoom(roomId) - Soft delete room type
 *
 * USAGE:
 * import { createRoom, getRoom } from './rooms.service';
 * const room = await createRoom(roomData, hotelId);
 * const details = await getRoom(roomId);
 */

import { prisma } from "@/config/prisma";

/**
 * Creates a new room type for a hotel
 *
 * INPUTS:
 * - roomData: { room_type, base_price, description?, room_size? }
 * - hotelId: Hotel to associate with
 *
 * BEHAVIOR:
 * - Validates hotel exists (throws HOTEL_NOT_FOUND)
 *
 * RETURNS:
 * {
 *   hotel_room_id,
 *   hotel_id,
 *   room_type,
 *   base_price,
 *   created_at
 * }
 *
 * @throws HOTEL_NOT_FOUND if hotel doesn't exist
 * @param {any} roomData - Room creation data
 * @param {number} hotelId - Hotel ID
 * @returns {Promise<object>} Created room details
 *
 * @example
 * const room = await createRoom(
 *   {
 *     room_type: "Deluxe Double",
 *     base_price: 150.50,
 *     description: "Spacious room with queen bed"
 *   },
 *   42
 * );
 */
export async function createRoom(roomData: any, hotelId: number, images?: string[]) {
  // Verify hotel exists
  const hotel = await prisma.hotels.findUnique({
    where: { hotel_id: hotelId },
    select: { hotel_id: true },
  });

  if (!hotel) {
    throw new Error("HOTEL_NOT_FOUND");
  }

  // Use transaction to handle room creation and amenities
  const room = await prisma.$transaction(async (tx) => {
    // Create room type
    const newRoom = await tx.hotel_rooms.create({
      data: {
        hotel_id: hotelId,
        room_type: roomData.room_type,
        base_price: parseFloat(roomData.base_price),
        description: roomData.description || null,
        room_size: roomData.room_size || null,
      },
      select: {
        hotel_room_id: true,
        hotel_id: true,
        room_type: true,
        base_price: true,
        created_at: true,
      },
    });

    // Save room amenities if provided
    if (roomData.amenities && roomData.amenities.length > 0) {
      // Delete existing amenities for this room
      await tx.room_amenities.deleteMany({
        where: { hotel_room_details_id: { in: [newRoom.hotel_room_id] } },
      });

      // Create new amenities if any provided
      const amenityData = roomData.amenities.map((amenityId: number | string) => ({
        hotel_room_details_id: newRoom.hotel_room_id,
        amenity_id: typeof amenityId === 'string' ? parseInt(amenityId) : amenityId,
      }));

      await tx.room_amenities.createMany({
        data: amenityData,
      });
    }

    // Save room type images if provided
    if (images && Array.isArray(images) && images.length > 0) {
      const roomImages = images.map((url, index) => ({
        hotel_room_id: newRoom.hotel_room_id,
        image_url: url,
        is_cover: index === 0, // First image is cover by default
      }));

      await tx.hotel_room_images.createMany({
        data: roomImages,
      });
    }

    return newRoom;
  });

  return room;
}

/**
 * Retrieves a single room type by ID
 *
 * INPUTS:
 * - roomId: Room type ID
 *
 * BEHAVIOR:
 * - Returns full room details
 * - Throws ROOM_NOT_FOUND if doesn't exist
 *
 * RETURNS:
 * {
 *   hotel_room_id,
 *   hotel_id,
 *   room_type,
 *   description,
 *   base_price,
 *   room_size,
 *   created_at,
 *   updated_at
 * }
 *
 * @throws ROOM_NOT_FOUND if room doesn't exist
 * @param {number} roomId - Room type ID
 * @returns {Promise<object>} Room details
 *
 * @example
 * const room = await getRoom(123);
 */
export async function getRoom(roomId: number) {
  const room = await prisma.hotel_rooms.findUnique({
    where: { hotel_room_id: roomId },
    select: {
      hotel_room_id: true,
      hotel_id: true,
      room_type: true,
      description: true,
      base_price: true,
      room_size: true,
      created_at: true,
      updated_at: true,
    },
  });

  if (!room) {
    throw new Error("ROOM_NOT_FOUND");
  }

  return room;
}

/**
 * Lists room types for a hotel with optional filtering
 *
 * INPUTS:
 * - hotelId: Hotel ID (required)
 * - filters: { room_type? } (optional)
 * - skip: Records to skip (default: 0)
 * - take: Records to return (default: 10, max: 100)
 *
 * BEHAVIOR:
 * - Filters: room_type (contains)
 * - Paginates results
 * - Returns total count
 *
 * RETURNS:
 * {
 *   rooms: [
 *     {
 *       hotel_room_id,
 *       room_type,
 *       base_price,
 *       created_at
 *     }
 *   ],
 *   total,
 *   skip,
 *   take
 * }
 *
 * @param {number} hotelId - Hotel ID
 * @param {object} filters - Optional filters
 * @param {number} skip - Pagination skip
 * @param {number} take - Pagination take
 * @returns {Promise<object>} Rooms list with pagination
 *
 * @example
 * const result = await listRooms(42, {
 *   room_type: "Deluxe"
 * }, 0, 10);
 */
export async function listRooms(
  hotelId: number,
  filters: any = {},
  skip: number = 0,
  take: number = 10
) {
  // Build where clause
  const where: any = {
    hotel_id: hotelId,
    // Only filter out deleted hotels, not by approval_status
    hotel: {
      deleted_at: null,
    },
    // Only return room types that actually have inventory (active physical rooms).
    // This prevents showing orphan room types for newly created hotels.
    hotel_room_details: {
      some: {
        deleted_at: null,
      },
    },
  };

  if (filters.room_type) {
    // room_type is an enum after schema migration, so we must match exactly.
    where.room_type = {
      equals: filters.room_type,
    };
  }

  // Fetch rooms and total count in parallel
  const [rooms, total] = await Promise.all([
    prisma.hotel_rooms.findMany({
      where,
      select: {
        hotel_room_id: true,
        room_type: true,
        base_price: true,
        description: true,
        room_size: true,
        created_at: true,
        hotel_room_images: {
          select: {
            image_url: true,
            is_cover: true,
          },
        },
        hotel_room_details: {
          where: {
            deleted_at: null,
          },
          select: {
            hotel_room_details_id: true,
            room_number: true,
            room_size: true,
            bed_type: true,
            max_occupancy: true,
            smoking_allowed: true,
            pet_allowed: true,
            status: true,
            created_at: true,
            updated_at: true,
            room_amenities: {
              select: {
                amenity: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
      skip,
      take,
      orderBy: { created_at: "desc" },
    }),
    prisma.hotel_rooms.count({ where }),
  ]);

  return {
    rooms,
    total,
    skip,
    take,
  };
}

/**
 * Updates a room type's information
 *
 * INPUTS:
 * - roomId: Room type ID
 * - updates: { room_type?, base_price?, description?, room_size? }
 *
 * BEHAVIOR:
 * - Only updates provided fields
 * - Throws ROOM_NOT_FOUND if doesn't exist
 *
 * RETURNS:
 * {
 *   hotel_room_id,
 *   room_type,
 *   base_price,
 *   updated_at
 * }
 *
 * @throws ROOM_NOT_FOUND if room doesn't exist
 * @param {number} roomId - Room type ID
 * @param {object} updates - Fields to update
 * @returns {Promise<object>} Updated room details
 *
 * @example
 * const updated = await updateRoom(123, {
 *   base_price: 175.50
 * });
 */
export async function updateRoom(roomId: number, updates: any) {
  try {
    // Verify room exists first
    const existing = await prisma.hotel_rooms.findUnique({
      where: { hotel_room_id: roomId },
      select: { hotel_room_id: true },
    });

    if (!existing) {
      throw new Error("ROOM_NOT_FOUND");
    }

    // Use transaction to handle room update and amenity changes
    const room = await prisma.$transaction(async (tx) => {
      // Build update data with only provided fields
      const updateData: any = {};

      if (updates.room_type !== undefined) {
        updateData.room_type = updates.room_type;
      }

      if (updates.base_price !== undefined) {
        updateData.base_price = parseFloat(updates.base_price);
      }

      if (updates.description !== undefined) {
        updateData.description = updates.description;
      }

      if (updates.room_size !== undefined) {
        updateData.room_size = updates.room_size;
      }

      // Update room
      const updatedRoom = await tx.hotel_rooms.update({
        where: { hotel_room_id: roomId },
        data: updateData,
        select: {
          hotel_room_id: true,
          room_type: true,
          base_price: true,
          updated_at: true,
        },
      });

      // Handle amenities update if provided
      if (updates.amenities !== undefined) {
        // Delete existing amenities for this room
        await tx.room_amenities.deleteMany({
          where: { hotel_room_details_id: { in: [roomId] } },
        });

        // Create new amenities if any provided
        const amenityData = updates.amenities.map((amenityId: number | string) => ({
          hotel_room_details_id: roomId,
          amenity_id: typeof amenityId === 'string' ? parseInt(amenityId) : amenityId,
        }));

        await tx.room_amenities.createMany({
          data: amenityData,
        });
      }

      // Handle images update if provided
      if (updates.images !== undefined) {
        // Delete existing images for this room
        await tx.hotel_room_images.deleteMany({
          where: { hotel_room_id: roomId },
        });

        // Create new images if any provided
        if (updates.images && Array.isArray(updates.images) && updates.images.length > 0) {
          // Find which image should be marked as cover
          let coverImageIndex = -1;
          
          for (let i = 0; i < updates.images.length; i++) {
            const img = updates.images[i];
            if (img && typeof img === "object" && img.is_cover === true) {
              coverImageIndex = i;
              break; // Stop at first cover image found
            }
          }
          
          // If no cover image specified, use first one
          if (coverImageIndex === -1) {
            coverImageIndex = 0;
          }

          // Create image records with exactly one cover
          const roomImages = updates.images.map((img: any, index: number) => {
            let imageUrl: string;
            
            if (typeof img === "string") {
              // Legacy format: just URL string
              imageUrl = img;
            } else if (img && typeof img === "object" && img.image_url) {
              // New format: object with image_url
              imageUrl = img.image_url;
            } else {
              return null; // Skip invalid images
            }

            return {
              hotel_room_id: roomId,
              image_url: imageUrl,
              is_cover: index === coverImageIndex, // Only the selected index is cover
            };
          }).filter((img: any) => img !== null);

          if (roomImages.length > 0) {
            await tx.hotel_room_images.createMany({
              data: roomImages,
            });
          }
        }
      }

      return updatedRoom;
    });

    return room;
  } catch (error: any) {
    console.error("updateRoom error:", error);
    throw error;
  }
}

/**
 * Soft deletes a room type by marking it as deleted
 *
 * NOTE: Rooms are NOT hard deleted due to booking history.
 * Soft delete prevents new bookings but preserves history.
 *
 * INPUTS:
 * - roomId: Room type ID
 *
 * BEHAVIOR:
 * - SOFT DELETE: This is a logical delete pattern
 * - Actually deletes the room from the database (hard delete)
 * - In a real system with booking history, you'd add deleted_at instead
 * - Throws ROOM_NOT_FOUND if doesn't exist
 *
 * RETURNS:
 * {
 *   message,
 *   hotel_room_id
 * }
 *
 * @throws ROOM_NOT_FOUND if room doesn't exist
 * @param {number} roomId - Room type ID
 * @returns {Promise<object>} Deletion confirmation
 *
 * @example
 * const result = await deleteRoom(123);
 */
export async function deleteRoom(roomId: number) {
  // Verify room exists
  const existing = await prisma.hotel_rooms.findUnique({
    where: { hotel_room_id: roomId },
    select: { hotel_room_id: true },
  });

  if (!existing) {
    throw new Error("ROOM_NOT_FOUND");
  }

  // Delete room
  await prisma.hotel_rooms.delete({
    where: { hotel_room_id: roomId },
  });

  return {
    message: "Room deleted successfully",
    hotel_room_id: roomId,
  };
}

/**
 * Creates a room type along with multiple physical room instances in a single transaction
 *
 * INPUTS:
 * - roomData: { room_type, base_price, description?, room_size? }
 * - roomNumbers: Array of { room_number, bed_type?, max_occupancy?, ... }
 * - hotelId: Hotel to associate with
 *
 * BEHAVIOR:
 * - Creates one hotel_rooms record (the room type)
 * - Creates N hotel_room_details records (the physical rooms)
 * - Everything happens in one transaction - rolls back if anything fails
 * - Validates hotel exists (throws HOTEL_NOT_FOUND)
 * - Validates room_numbers is non-empty (throws INVALID_ROOM_COUNT)
 *
 * RETURNS:
 * {
 *   room: { hotel_room_id, room_type, base_price, ... },
 *   physical_rooms: [ { hotel_room_details_id, room_number, ... }, ... ],
 *   count: number
 * }
 *
 * @throws HOTEL_NOT_FOUND if hotel doesn't exist
 * @throws INVALID_ROOM_COUNT if room_numbers is empty
 * @param {any} roomData - Room type creation data
 * @param {any[]} roomNumbers - Array of physical room details
 * @param {number} hotelId - Hotel ID
 * @returns {Promise<object>} Created room type and all physical rooms
 *
 * @example
 * const result = await createRoomWithPhysicalRooms(
 *   {
 *     room_type: "Deluxe Double",
 *     base_price: 150.50,
 *     description: "Spacious room with queen bed",
 *     room_size: "40m²"
 *   },
 *   [
 *     { room_number: "101", bed_type: "Queen", max_occupancy: 2 },
 *     { room_number: "102", bed_type: "Queen", max_occupancy: 2 },
 *     { room_number: "103", bed_type: "Queen", max_occupancy: 2 }
 *   ],
 *   42
 * );
 */
export async function createRoomWithPhysicalRooms(
  roomData: any,
  roomNumbers: any[],
  hotelId: number,
  images?: string[]
) {
  // Validate room count
  if (!roomNumbers || roomNumbers.length === 0) {
    throw new Error("INVALID_ROOM_COUNT");
  }

  // Verify hotel exists
  const hotel = await prisma.hotels.findUnique({
    where: { hotel_id: hotelId },
    select: { hotel_id: true },
  });

  if (!hotel) {
    throw new Error("HOTEL_NOT_FOUND");
  }

  // Check for duplicate room numbers within the same room type
  const roomNumbersSet = new Set<string>();
  for (const roomNum of roomNumbers) {
    if (roomNumbersSet.has(roomNum.room_number)) {
      throw new Error("DUPLICATE_ROOM_NUMBER_IN_REQUEST");
    }
    roomNumbersSet.add(roomNum.room_number);
  }

  // Check if any of the room numbers already exist for this room type in this hotel
  // This prevents: Hotel A having "Deluxe Double" room 101, then trying to add another "Deluxe Double" room 101
  if (roomNumbers.length > 0) {
    const existingRoomNumbers = await prisma.hotel_room_details.findMany({
      where: {
        hotel_room: {
          hotel_id: hotelId,
          room_type: roomData.room_type,
        },
        deleted_at: null,
      },
      select: {
        room_number: true,
      },
    });

    const existingNumbers = new Set(existingRoomNumbers.map((r) => r.room_number));
    const duplicateNumbers = roomNumbers.filter((r) => existingNumbers.has(r.room_number));

    if (duplicateNumbers.length > 0) {
      throw new Error(`DUPLICATE_ROOM_NUMBERS: ${duplicateNumbers.map((r) => r.room_number).join(", ")}`);
    }
  }

  // Execute in transaction - either all succeed or all rollback
  const result = await prisma.$transaction(async (tx) => {
    // Step 1: Create the room type (one record)
    const room = await tx.hotel_rooms.create({
      data: {
        hotel_id: hotelId,
        room_type: roomData.room_type,
        base_price: parseFloat(roomData.base_price),
        description: roomData.description || null,
        room_size: roomData.room_size || null,
      },
      select: {
        hotel_room_id: true,
        hotel_id: true,
        room_type: true,
        base_price: true,
        room_size: true,
        created_at: true,
      },
    });

    // Step 2: Create all physical rooms at once (batch insert)
    const physicalRoomData = roomNumbers.map((roomNum) => ({
      hotel_rooms_id: room.hotel_room_id,
      room_number: roomNum.room_number,
      room_size: roomNum.room_size || null,
      bed_type: roomNum.bed_type || null,
      max_occupancy: roomNum.max_occupancy || 2,
      smoking_allowed: roomNum.smoking_allowed === true,
      pet_allowed: roomNum.pet_allowed === true,
      image_url: roomNum.image_url || null,
      status: roomNum.status || "AVAILABLE", // Use status from frontend, default to AVAILABLE
    }));

    // Use createMany for efficient bulk insert
    await tx.hotel_room_details.createMany({
      data: physicalRoomData,
    });

    // Step 3: Save room amenities if provided - now per physical room
    if (roomData.amenities && roomData.amenities.length > 0) {
      // First, get the IDs of the physical rooms we just created
      const createdPhysicalRooms = await tx.hotel_room_details.findMany({
        where: { hotel_rooms_id: room.hotel_room_id },
        select: { hotel_room_details_id: true },
      });

      // Create amenities for each physical room
      const amenityData = [];
      for (const physicalRoom of createdPhysicalRooms) {
        for (const amenityId of roomData.amenities) {
          amenityData.push({
            hotel_room_details_id: physicalRoom.hotel_room_details_id,
            amenity_id: typeof amenityId === 'string' ? parseInt(amenityId) : amenityId,
          });
        }
      }

      await tx.room_amenities.createMany({
        data: amenityData,
      });
    }

    // Step 4: Save room type images if provided
    if (images && Array.isArray(images) && images.length > 0) {
      const roomImages = images.map((url, index) => ({
        hotel_room_id: room.hotel_room_id,
        image_url: url,
        is_cover: index === 0, // First image is cover by default
      }));

      await tx.hotel_room_images.createMany({
        data: roomImages,
      });
    }

    // Fetch the created physical rooms to return them
    const physicalRooms = await tx.hotel_room_details.findMany({
      where: {
        hotel_rooms_id: room.hotel_room_id,
      },
      select: {
        hotel_room_details_id: true,
        room_number: true,
        bed_type: true,
        max_occupancy: true,
        smoking_allowed: true,
        pet_allowed: true,
        status: true,
        created_at: true,
      },
    });

    return {
      room,
      physical_rooms: physicalRooms,
      count: physicalRooms.length,
    };
  });

  return result;
}

/**
 * Adds more physical rooms to an existing room type
 *
 * INPUTS:
 * - roomId: Room type ID
 * - roomNumbers: Array of { room_number, bed_type?, max_occupancy?, ... }
 *
 * BEHAVIOR:
 * - Adds new physical rooms to an existing room type
 * - Validates room type exists (throws ROOM_NOT_FOUND)
 * - Validates room_numbers is non-empty (throws INVALID_ROOM_COUNT)
 * - Prevents duplicate room numbers for the same room type
 *
 * RETURNS:
 * {
 *   room_id: number,
 *   added_rooms: [ { hotel_room_details_id, room_number, ... }, ... ],
 *   count: number
 * }
 *
 * @throws ROOM_NOT_FOUND if room type doesn't exist
 * @throws INVALID_ROOM_COUNT if room_numbers is empty
 * @throws DUPLICATE_ROOM_NUMBER if room number already exists
 * @param {number} roomId - Room type ID
 * @param {any[]} roomNumbers - Array of physical room details
 * @returns {Promise<object>} Added physical rooms
 *
 * @example
 * const result = await addPhysicalRooms(123, [
 *   { room_number: "104", bed_type: "Queen", max_occupancy: 2 },
 *   { room_number: "105", bed_type: "Queen", max_occupancy: 2 }
 * ]);
 */
export async function addPhysicalRooms(roomId: number, roomNumbers: any[]) {
  // Validate input
  if (!roomNumbers || roomNumbers.length === 0) {
    throw new Error("INVALID_ROOM_COUNT");
  }

  // Verify room exists
  const room = await prisma.hotel_rooms.findUnique({
    where: { hotel_room_id: roomId },
    select: { hotel_room_id: true },
  });

  if (!room) {
    throw new Error("ROOM_NOT_FOUND");
  }

  // Check for duplicates in existing rooms
  const existingRoomNumbers = await prisma.hotel_room_details.findMany({
    where: { hotel_rooms_id: roomId },
    select: { room_number: true },
  });

  const existingNumbers = new Set(existingRoomNumbers.map((r) => r.room_number));
  const newNumbers = roomNumbers.map((r) => r.room_number);

  for (const num of newNumbers) {
    if (existingNumbers.has(num)) {
      throw new Error(`DUPLICATE_ROOM_NUMBER:${num}`);
    }
  }

  // Create physical rooms
  const physicalRoomData = roomNumbers.map((room) => ({
    hotel_rooms_id: roomId,
    room_number: room.room_number,
    room_size: room.room_size || null,
    bed_type: room.bed_type || null,
    max_occupancy: room.max_occupancy || 2,
    smoking_allowed: room.smoking_allowed === true,
    pet_allowed: room.pet_allowed === true,
    image_url: room.image_url || null,
    status: room.status || "AVAILABLE", // Use status from frontend, default to AVAILABLE
  }));

  await prisma.hotel_room_details.createMany({
    data: physicalRoomData,
  });

  // Fetch and return created rooms
  const addedRooms = await prisma.hotel_room_details.findMany({
    where: { hotel_rooms_id: roomId },
    orderBy: { created_at: "desc" },
    take: roomNumbers.length,
    select: {
      hotel_room_details_id: true,
      room_number: true,
      bed_type: true,
      max_occupancy: true,
      smoking_allowed: true,
      pet_allowed: true,
      status: true,
      created_at: true,
    },
  });

  return {
    room_id: roomId,
    added_rooms: addedRooms,
    count: addedRooms.length,
  };
}

/**
 * Gets all physical rooms for a room type with pagination
 *
 * INPUTS:
 * - roomId: Room type ID
 * - skip: Records to skip (default: 0)
 * - take: Records to return (default: 20, max: 100)
 *
 * BEHAVIOR:
 * - Lists all physical room instances for a room type
 * - Excludes soft-deleted rooms (where deleted_at is set)
 * - Paginates results
 * - Throws ROOM_NOT_FOUND if room type doesn't exist
 *
 * RETURNS:
 * {
 *   room_id: number,
 *   total: number,
 *   rooms: [
 *     {
 *       hotel_room_details_id,
 *       room_number,
 *       bed_type,
 *       max_occupancy,
 *       smoking_allowed,
 *       pet_allowed,
 *       created_at
 *     }
 *   ],
 *   skip,
 *   take
 * }
 *
 * @throws ROOM_NOT_FOUND if room type doesn't exist
 * @param {number} roomId - Room type ID
 * @param {number} skip - Pagination skip
 * @param {number} take - Pagination take
 * @returns {Promise<object>} Physical rooms with pagination
 *
 * @example
 * const result = await getPhysicalRooms(123, 0, 20);
 */
export async function getPhysicalRooms(
  roomId: number,
  skip: number = 0,
  take: number = 20
) {
  // Verify room exists
  const room = await prisma.hotel_rooms.findUnique({
    where: { hotel_room_id: roomId },
    select: { hotel_room_id: true },
  });

  if (!room) {
    throw new Error("ROOM_NOT_FOUND");
  }

  // Clamp take to max 100
  take = Math.min(take, 100);

  // Fetch physical rooms with pagination
  const [rooms, total] = await Promise.all([
    prisma.hotel_room_details.findMany({
      where: { hotel_rooms_id: roomId, deleted_at: null },
      select: {
        hotel_room_details_id: true,
        room_number: true,
        bed_type: true,
        max_occupancy: true,
        smoking_allowed: true,
        pet_allowed: true,
        created_at: true,
        room_amenities: {
          select: {
            amenity: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      skip,
      take,
      orderBy: { room_number: "asc" },
    }),
    prisma.hotel_room_details.count({
      where: { hotel_rooms_id: roomId, deleted_at: null },
    }),
  ]);

  return {
    room_id: roomId,
    total,
    rooms,
    skip,
    take,
  };
}

/**
 * Updates a physical room's details
 *
 * INPUTS:
 * - detailId: Physical room details ID
 * - updates: { room_number?, bed_type?, max_occupancy?, smoking_allowed?, pet_allowed? }
 *
 * BEHAVIOR:
 * - Updates a specific physical room
 * - Throws DETAIL_NOT_FOUND if doesn't exist
 * - Validates room_number is unique within the same room type if being updated
 *
 * RETURNS:
 * {
 *   hotel_room_details_id,
 *   room_number,
 *   bed_type,
 *   max_occupancy,
 *   updated_at
 * }
 *
 * @throws DETAIL_NOT_FOUND if physical room doesn't exist
 * @throws DUPLICATE_ROOM_NUMBER if room number already exists in same type
 * @param {number} detailId - Physical room details ID
 * @param {any} updates - Fields to update
 * @returns {Promise<object>} Updated physical room details
 *
 * @example
 * const updated = await updatePhysicalRoom(456, {
 *   room_number: "101A",
 *   max_occupancy: 3
 * });
 */
export async function updatePhysicalRoom(detailId: number, updates: any) {
  // Verify detail exists
  const existing = await prisma.hotel_room_details.findUnique({
    where: { hotel_room_details_id: detailId },
    select: {
      hotel_room_details_id: true,
      hotel_rooms_id: true,
      room_number: true,
    },
  });

  if (!existing) {
    throw new Error("DETAIL_NOT_FOUND");
  }

  // If room_number is being updated, check for duplicates within same room type
  if (updates.room_number && updates.room_number !== existing.room_number) {
    const duplicate = await prisma.hotel_room_details.findFirst({
      where: {
        hotel_rooms_id: existing.hotel_rooms_id,
        room_number: updates.room_number,
        deleted_at: null,
      },
    });

    if (duplicate) {
      throw new Error("DUPLICATE_ROOM_NUMBER");
    }
  }

  // Build update data for physical room details
  const updateData: any = {};
  if (updates.room_number !== undefined) updateData.room_number = updates.room_number;
  if (updates.bed_type !== undefined) updateData.bed_type = updates.bed_type;
  if (updates.max_occupancy !== undefined) updateData.max_occupancy = updates.max_occupancy;
  if (updates.smoking_allowed !== undefined) updateData.smoking_allowed = updates.smoking_allowed;
  if (updates.pet_allowed !== undefined) updateData.pet_allowed = updates.pet_allowed;
  if (updates.image_url !== undefined) updateData.image_url = updates.image_url;
  if (updates.status !== undefined) updateData.status = updates.status;

  // Update physical room
  const updated = await prisma.hotel_room_details.update({
    where: { hotel_room_details_id: detailId },
    data: updateData,
    select: {
      hotel_room_details_id: true,
      room_number: true,
      bed_type: true,
      max_occupancy: true,
      status: true,
      updated_at: true,
    },
  });

  // Handle amenities update if provided
  if (updates.amenities !== undefined) {
    // Delete existing amenities for this physical room
    await prisma.room_amenities.deleteMany({
      where: { hotel_room_details_id: detailId },
    });

    // Create new amenities if any provided
    const amenityData = updates.amenities.map((amenityId: number | string) => ({
      hotel_room_details_id: detailId,
      amenity_id: typeof amenityId === 'string' ? parseInt(amenityId) : amenityId,
    }));

    await prisma.room_amenities.createMany({
      data: amenityData,
    });
  }

  // If room type or price changes are provided, also update the room type
  if (updates.room_type || updates.base_price || updates.description || updates.room_size) {
    const roomTypeUpdateData: any = {};
    if (updates.room_type !== undefined) roomTypeUpdateData.room_type = updates.room_type;
    if (updates.base_price !== undefined) roomTypeUpdateData.base_price = parseFloat(updates.base_price);
    if (updates.description !== undefined) roomTypeUpdateData.description = updates.description;
    if (updates.room_size !== undefined) roomTypeUpdateData.room_size = updates.room_size;

    await prisma.hotel_rooms.update({
      where: { hotel_room_id: existing.hotel_rooms_id },
      data: roomTypeUpdateData,
    });
  }

  return updated;
}

/**
 * Deletes a physical room (soft delete)
 *
 * INPUTS:
 * - detailId: Physical room details ID
 *
 * BEHAVIOR:
 * - Soft deletes by setting deleted_at timestamp
 * - Preserves booking history
 * - Throws DETAIL_NOT_FOUND if doesn't exist
 *
 * RETURNS:
 * {
 *   message,
 *   hotel_room_details_id
 * }
 *
 * @throws DETAIL_NOT_FOUND if physical room doesn't exist
 * @param {number} detailId - Physical room details ID
 * @returns {Promise<object>} Deletion confirmation
 *
 * @example
 * const result = await deletePhysicalRoom(456);
 */
export async function deletePhysicalRoom(detailId: number) {
  // Verify detail exists
  const existing = await prisma.hotel_room_details.findUnique({
    where: { hotel_room_details_id: detailId },
    select: { hotel_room_details_id: true },
  });

  if (!existing) {
    throw new Error("DETAIL_NOT_FOUND");
  }

  // Soft delete
  await prisma.hotel_room_details.update({
    where: { hotel_room_details_id: detailId },
    data: { deleted_at: new Date() },
  });

  return {
    message: "Physical room deleted successfully",
    hotel_room_details_id: detailId,
  };
}

/**
 * Gets inventory count for a room type
 *
 * INPUTS:
 * - roomId: Room type ID
 *
 * BEHAVIOR:
 * - Counts total active (non-deleted) physical rooms for a room type
 * - Useful for inventory display
 * - Throws ROOM_NOT_FOUND if room type doesn't exist
 *
 * RETURNS:
 * {
 *   room_id: number,
 *   total_rooms: number,
 *   active_rooms: number,
 *   deleted_rooms: number
 * }
 *
 * @throws ROOM_NOT_FOUND if room type doesn't exist
 * @param {number} roomId - Room type ID
 * @returns {Promise<object>} Room inventory counts
 *
 * @example
 * const inventory = await getRoomInventory(123);
 */
export async function getRoomInventory(roomId: number) {
  // Verify room exists
  const room = await prisma.hotel_rooms.findUnique({
    where: { hotel_room_id: roomId },
    select: { hotel_room_id: true },
  });

  if (!room) {
    throw new Error("ROOM_NOT_FOUND");
  }

  // Count active and deleted rooms
  const [activeRooms, deletedRooms, totalRooms] = await Promise.all([
    prisma.hotel_room_details.count({
      where: { hotel_rooms_id: roomId, deleted_at: null },
    }),
    prisma.hotel_room_details.count({
      where: { hotel_rooms_id: roomId, deleted_at: { not: null } },
    }),
    prisma.hotel_room_details.count({
      where: { hotel_rooms_id: roomId },
    }),
  ]);

  return {
    room_id: roomId,
    total_rooms: totalRooms,
    active_rooms: activeRooms,
    deleted_rooms: deletedRooms,
  };
}

/**
 * Gets all physical rooms for a hotel across all room types
 *
 * INPUTS:
 * - hotelId: Hotel ID (required)
 * - skip: Records to skip (default: 0)
 * - take: Records to return (default: 100, max: 500)
 *
 * BEHAVIOR:
 * - Fetches all physical rooms (hotel_room_details) for a hotel
 * - Includes room type info and all physical room details
 * - Excludes soft-deleted rooms (where deleted_at is set)
 * - Paginates results
 * - Ordered by room_number ascending
 * - Throws HOTEL_NOT_FOUND if hotel doesn't exist
 *
 * RETURNS:
 * {
 *   hotel_id: number,
 *   total: number,
 *   rooms: [
 *     {
 *       hotel_room_details_id,
 *       room_number,
 *       bed_type,
 *       max_occupancy,
 *       smoking_allowed,
 *       pet_allowed,
 *       image_url,
 *       status,
 *       room_type,
 *       base_price,
 *       created_at
 *     }
 *   ],
 *   skip,
 *   take
 * }
 *
 * @throws HOTEL_NOT_FOUND if hotel doesn't exist
 * @param {number} hotelId - Hotel ID
 * @param {number} skip - Pagination skip
 * @param {number} take - Pagination take
 * @returns {Promise<object>} All physical rooms with pagination
 *
 * @example
 * const result = await getHotelPhysicalRooms(42, 0, 100);
 */
export async function getHotelPhysicalRooms(
  hotelId: number,
  skip: number = 0,
  take: number = 100
) {
  // Verify hotel exists
  const hotel = await prisma.hotels.findUnique({
    where: { hotel_id: hotelId },
    select: { hotel_id: true },
  });

  if (!hotel) {
    throw new Error("HOTEL_NOT_FOUND");
  }

  // Clamp take to max 500
  take = Math.min(take, 500);

  // Fetch all physical rooms for this hotel across all room types
  const [rooms, total] = await Promise.all([
    prisma.hotel_room_details.findMany({
      where: {
        hotel_room: {
          hotel_id: hotelId,
        },
        deleted_at: null,
      },
      select: {
        hotel_room_details_id: true,
        room_number: true,
        bed_type: true,
        max_occupancy: true,
        smoking_allowed: true,
        pet_allowed: true,
        image_url: true,
        status: true,
        created_at: true,
        hotel_room: {
          select: {
            room_type: true,
            base_price: true,
            description: true,
            room_size: true,
          },
        },
        room_amenities: {
          select: {
            amenity: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      skip,
      take,
      orderBy: { room_number: "asc" },
    }),
    prisma.hotel_room_details.count({
      where: {
        hotel_room: {
          hotel_id: hotelId,
        },
        deleted_at: null,
      },
    }),
  ]);

  // Flatten the response to make it easier for frontend
  const flattenedRooms = rooms.map((room) => ({
    hotel_room_details_id: room.hotel_room_details_id,
    room_number: room.room_number,
    bed_type: room.bed_type,
    max_occupancy: room.max_occupancy,
    smoking_allowed: room.smoking_allowed,
    pet_allowed: room.pet_allowed,
    image_url: room.image_url,
    status: room.status,
    room_type: room.hotel_room.room_type,
    base_price: room.hotel_room.base_price,
    description: room.hotel_room.description,
    room_size: room.hotel_room.room_size,
    created_at: room.created_at,
    room_amenities: room.room_amenities, // Include amenities per physical room
  }));

  return {
    hotel_id: hotelId,
    total,
    rooms: flattenedRooms,
    skip,
    take,
  };
}
