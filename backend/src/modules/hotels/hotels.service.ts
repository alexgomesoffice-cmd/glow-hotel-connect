/**
 * FILE: src/modules/hotels/hotels.service.ts
 * PURPOSE: Business logic for hotel operations
 *
 * WHAT IT DOES:
 * - Creates new hotel entries with default DRAFT status
 * - Retrieves hotel details by ID
 * - Lists all hotels with filtering and pagination
 * - Updates hotel information
 * - Changes hotel approval status
 * - Soft deletes hotels
 *
 * USAGE:
 * import { createHotel, getHotel, updateHotel } from './hotels.service';
 * const hotel = await createHotel(hotelData, createdBy);
 * const details = await getHotel(hotelId);
 * await updateHotel(hotelId, updates);
 *
 * DATABASE TABLES:
 * - hotels: Main hotel table with approval workflow
 */

import { prisma } from "@/config/prisma";
import { Prisma, BedType as BedTypeEnum, HotelType as HotelTypeEnum, RoomType as RoomTypeEnum } from "@prisma/client";
import { hashPassword } from "@/utils/password";

export type EnumOption = { value: string; label: string };

const HOTEL_LABELS: Record<HotelTypeEnum, string> = {
  hotel: "Hotel",
  resort: "Resort",
  boutique: "Boutique",
  hostel: "Hostel",
};

const ROOM_LABELS: Record<RoomTypeEnum, string> = {
  standard: "Standard",
  delux: "Delux",
  suite: "Suite",
  penthouse: "Penthouse",
};

const BED_LABELS: Record<BedTypeEnum, string> = {
  Single: "Single",
  Double: "Double",
  Queen: "Queen",
  King: "King",
  Twin: "Twin",
};

export function getHotelTypeOptions(): EnumOption[] {
  return (Object.values(HotelTypeEnum) as HotelTypeEnum[]).map((v) => ({
    value: v,
    label: HOTEL_LABELS[v],
  }));
}

export function getRoomTypeOptions(): EnumOption[] {
  return (Object.values(RoomTypeEnum) as RoomTypeEnum[]).map((v) => ({
    value: v,
    label: ROOM_LABELS[v],
  }));
}

export function getBedTypeOptions(): EnumOption[] {
  return (Object.values(BedTypeEnum) as BedTypeEnum[]).map((v) => ({
    value: v,
    label: BED_LABELS[v],
  }));
}

/**
 * Get search suggestions for hotels and cities
 * Returns up to 10 suggestions each for hotels and cities matching the query
 */
export async function getSearchSuggestions(query: string): Promise<{
  hotels: Array<{ id: number; name: string; city: string; type: 'hotel' }>;
  cities: Array<{ id: number; name: string; type: 'city' }>;
}> {
  const lowerQuery = query.toLowerCase();

  // Get hotel suggestions
  const hotels = await prisma.hotels.findMany({
    where: {
      approval_status: "PUBLISHED",
      deleted_at: null,
      OR: [
        { name: { contains: lowerQuery } },
        { city: { contains: lowerQuery } },
      ],
    },
    select: {
      hotel_id: true,
      name: true,
      city: true,
    },
    take: 10,
    orderBy: {
      name: 'asc',
    },
  });

  // Get city suggestions
  const cities = await prisma.cities.findMany({
    where: {
      name: { contains: lowerQuery },
    },
    select: {
      id: true,
      name: true,
    },
    take: 10,
    orderBy: {
      name: 'asc',
    },
  });

  return {
    hotels: hotels.map(hotel => ({
      id: hotel.hotel_id,
      name: hotel.name,
      city: hotel.city || '',
      type: 'hotel' as const,
    })),
    cities: cities.map(city => ({
      id: city.id,
      name: city.name,
      type: 'city' as const,
    })),
  };
}

/**
 * Creates a new hotel entry
 *
 * WORKFLOW:
 * 1. Create hotel with provided data
 * 2. Set approval_status to DRAFT by default
 * 3. Set created_by to the system admin creating it
 * 4. Return created hotel object
 *
 * @param {object} hotelData - Hotel information (name, email, address, etc)
 * @param {number} createdBy - System admin ID who is creating this hotel
 * @returns {{hotel_id, name, email, city, approval_status, created_at}} Created hotel
 * @throws {Error} DATABASE_ERROR
 *
 * @example
 * const hotel = await createHotel({
 *   name: "Grand Hotel",
 *   email: "info@grandhotel.com",
 *   city: "Dhaka",
 *   address: "123 Main St"
 * }, 1);
 */
export async function createHotel(hotelData: any, createdBy: number) {
  // create minimal hotel row only
  const hotel = await prisma.hotels.create({
    data: {
      name: hotelData.name,
      email: hotelData.email || null,
      address: hotelData.address || null,
      city: hotelData.city || null,
      hotel_type: hotelData.hotel_type || null,
      emergency_contact1: hotelData.emergency_contact1 || null,
      emergency_contact2: hotelData.emergency_contact2 || null,
      owner_name: hotelData.owner_name || null,
      zip_code: hotelData.zip_code || null,
      created_by: createdBy,
      approval_status: "DRAFT",
    },
    select: {
      hotel_id: true,
      name: true,
      email: true,
      city: true,
      approval_status: true,
      created_at: true,
    },
  });

  return hotel;
}

/**
 * Creates hotel with amenities and images in a single transaction
 *
 * WORKFLOW:
 * 1. Create hotel record
 * 2. Insert details row if provided
 * 3. Insert amenity records in hotel_amenities (one row per selected amenity)
 * 4. Insert image records in hotel_images (one row per image URL)
 * 5. Optionally create a hotel admin account and details when `admin` field is provided
 * 6. Return created hotel with all related records
 *
 * @param {object} hotelData - Hotel information plus optional details, amenities, images, and admin
 * @param {number} createdBy - System admin ID
 * @returns {{hotel_id, name, amenities, images, hotel_admins?}} Created hotel with details (and admin)
 * @throws {Error} DATABASE_ERROR | EMAIL_ALREADY_EXISTS
 */
export async function createHotelWithDetails(hotelData: any, createdBy: number) {
  // use transaction for atomic work
  const result = await prisma.$transaction(async (tx) => {
    const { details, amenities, images, admin, ...basic } = hotelData;

    // 1. create base hotel
    // only include columns that actually exist on the hotels table
    const hotel = await tx.hotels.create({
      data: {
        name: basic.name,
        email: basic.email || null,
        address: basic.address || null,
        city: basic.city || null,
        hotel_type: basic.hotel_type || null,
        emergency_contact1: basic.emergency_contact1 || null,
        emergency_contact2: basic.emergency_contact2 || null,
        owner_name: basic.owner_name || null,
        zip_code: basic.zip_code || null,
        created_by: createdBy,
        approval_status: "DRAFT",
      },
    });

    // 2. create details row if any
    const rawStarRating = details?.star_rating ?? hotelData.star_rating;
    const rawGuestRating = details?.guest_rating ?? hotelData.guest_rating;
    const shouldCreateDetails =
      (details && Object.keys(details).length > 0) ||
      rawStarRating !== undefined ||
      rawGuestRating !== undefined;

    if (shouldCreateDetails) {
      await tx.hotel_details.create({
        data: {
          hotel_id: hotel.hotel_id,
          description: details?.description || null,
          reception_no1: details?.reception_no1 || null,
          reception_no2: details?.reception_no2 || null,
          star_rating: rawStarRating ? parseFloat(rawStarRating) : null,
          guest_rating: rawGuestRating ?? 0,
        },
      });
    }

    // 3. hotel amenities
    if (amenities && Array.isArray(amenities) && amenities.length) {
      const amenityRows = [];
      for (const name of amenities) {
        const amen = await tx.amenities.findUnique({ where: { name } });
        if (amen) amenityRows.push({ hotel_id: hotel.hotel_id, amenity_id: amen.id });
      }
      if (amenityRows.length) {
        await tx.hotel_amenities.createMany({ data: amenityRows });
      }
    }

    // 4. hotel images
    if (images && Array.isArray(images) && images.length) {
      const urls = images.slice(0, 8);
      const imgRows = urls.map((url: string) => ({ hotel_id: hotel.hotel_id, image_url: url }));
      await tx.hotel_images.createMany({ data: imgRows });
    }

    // 5. optional hotel admin creation
    let hotelAdmin = null;
    if (admin) {
      // ensure unique email
      const existing = await tx.hotel_admins.findUnique({ where: { email: admin.email } });
      if (existing) {
        throw new Error("EMAIL_ALREADY_EXISTS");
      }
      const hashed = await hashPassword(admin.password);
      hotelAdmin = await tx.hotel_admins.create({
        data: {
          hotel_id: hotel.hotel_id,
          name: admin.name,
          email: admin.email,
          password: hashed,
          created_by: createdBy,
          role_id: 1,
        },
      });
      await tx.hotel_admin_details.create({
        data: {
          hotel_admin_id: hotelAdmin.hotel_admin_id,
          phone: admin.phone || null,
          nid_no: admin.nid_no || null,
          manager_name: admin.manager_name || null,
          manager_phone: admin.manager_phone || null,
          address: admin.address || null,
          passport: admin.passport || null,
          dob: admin.dob ? new Date(admin.dob) : null,
          image_url: admin.image_url || null,
        },
      });
    }

    // 6. return hotel with relations (and maybe admin)
    const completeHotel = await tx.hotels.findUnique({
      where: { hotel_id: hotel.hotel_id },
      include: {
        hotel_details: true,
        hotel_amenities: { include: { amenity: true } },
        hotel_images: true,
        hotel_admin: { include: { hotel_admin_details: true } },
      },
    });

    return completeHotel;
  });

  return result;
}
/**
 * Retrieves a hotel by ID
 *
 * WORKFLOW:
 * 1. Find hotel by ID
 * 2. Return hotel object with all details
 *
 * @param {number} hotelId - Hotel ID
 * @returns {{hotel_id, name, email, address, city, approval_status, ...}} Hotel details
 * @throws {Error} HOTEL_NOT_FOUND
 *
 * @example
 * const hotel = await getHotel(5);
 * console.log("Hotel:", hotel);
 */
export async function getHotel(hotelId: number) {
  const hotel = await prisma.hotels.findUnique({
    where: { hotel_id: hotelId },
    include: {
      hotel_details: true,
      hotel_amenities: { include: { amenity: true } },
      hotel_images: true,
    },
  });

  if (!hotel) {
    throw new Error("HOTEL_NOT_FOUND");
  }

  return hotel;
}

/**
 * Lists all known amenities
 *
 * @returns {{id, name}[]} Amenity options
 */
export async function listAmenities() {
  const records = await prisma.amenities.findMany({ 
    where: { context: "HOTEL", is_active: true },
    select: { id: true, name: true, icon: true, context: true } 
  });
  return records;
}

/**
 * Lists hotels with filtering and pagination
 *
 * WORKFLOW:
 * 1. Build filter conditions (status, city, etc)
 * 2. Query hotels with pagination
 * 3. Get total count for pagination metadata
 * 4. Return paginated results with count
 *
 * @param {object} filters - Filter options (approval_status, city, etc)
 * @param {number} skip - Records to skip (pagination)
 * @param {number} take - Records to return (pagination)
 * @returns {{hotels: Array, total: number, skip, take}} Paginated list
 *
 * @example
 * const result = await listHotels(
 *   { approval_status: "PUBLISHED", city: "Dhaka" },
 *   0,
 *   10
 * );
 */
export async function listHotels(
  filters: any = {},
  skip: number = 0,
  take: number = 10
) {
  // Build where clause
  const where: Prisma.hotelsWhereInput = {};

  // Exclude soft-deleted hotels (deleted_at IS NULL)
  where.deleted_at = null;

  if (filters.approval_status) {
    where.approval_status = filters.approval_status;
  }

  if (filters.city) {
    where.city = { contains: filters.city };
  }

  if (filters.hotel_type) {
    where.hotel_type = filters.hotel_type;
  }

  // Query hotels with minimal fields plus relations if needed
  const [hotels, total] = await Promise.all([
    prisma.hotels.findMany({
      where,
      skip,
      take,
      select: {
        hotel_id: true,
        name: true,
        email: true,
        city: true,
        hotel_type: true,
        approval_status: true,
        created_at: true,
        // optionally expose some detail
        hotel_details: { select: { star_rating: true, description: true } },
        // Include hotel images with is_cover field
        hotel_images: {
          select: {
            image_url: true,
            is_cover: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
    }),
    prisma.hotels.count({ where }),
  ]);

  return {
    hotels,
    total,
    skip,
    take,
  };
}

/**
 * Updates hotel information
 *
 * WORKFLOW:
 * 1. Check if hotel exists
 * 2. Update provided fields
 * 3. Return updated hotel object
 *
 * @param {number} hotelId - Hotel ID
 * @param {object} updates - Fields to update
 * @returns {{hotel_id, name, email, city, ...}} Updated hotel
 * @throws {Error} HOTEL_NOT_FOUND
 *
 * @example
 * const updated = await updateHotel(5, {
 *   name: "Grand Hotel Updated",
 *   star_rating: 4.5
 * });
 */
export async function updateHotel(hotelId: number, updates: any) {
  try {
    // Ensure hotel exists
    const existingHotel = await prisma.hotels.findUnique({ where: { hotel_id: hotelId } });
    if (!existingHotel) throw new Error("HOTEL_NOT_FOUND");

    // perform all related updates in a transaction
    const hotel = await prisma.$transaction(async (tx) => {
      // 1. update base hotel fields
      const baseData: any = {};
      if (updates.name !== undefined) baseData.name = updates.name;
      if (updates.email !== undefined) baseData.email = updates.email;
      if (updates.address !== undefined) baseData.address = updates.address;
      if (updates.city !== undefined) baseData.city = updates.city;
      if (updates.hotel_type !== undefined) baseData.hotel_type = updates.hotel_type;
      if (updates.owner_name !== undefined) baseData.owner_name = updates.owner_name;
      if (updates.emergency_contact1 !== undefined) baseData.emergency_contact1 = updates.emergency_contact1;
      if (updates.emergency_contact2 !== undefined) baseData.emergency_contact2 = updates.emergency_contact2;
      if (updates.zip_code !== undefined) baseData.zip_code = updates.zip_code;

      // Only update if there are fields to update
      if (Object.keys(baseData).length > 0) {
        await tx.hotels.update({ where: { hotel_id: hotelId }, data: baseData });
      }

      // 2. details
      if (updates.details) {
        const d = updates.details;
        await tx.hotel_details.upsert({
          where: { hotel_id: hotelId },
          update: {
            description: d.description || null,
            reception_no1: d.reception_no1 || null,
            reception_no2: d.reception_no2 || null,
            star_rating: d.star_rating ? parseFloat(d.star_rating) : null,
            guest_rating: d.guest_rating ?? 0,
          },
          create: {
            hotel_id: hotelId,
            description: d.description || null,
            reception_no1: d.reception_no1 || null,
            reception_no2: d.reception_no2 || null,
            star_rating: d.star_rating ? parseFloat(d.star_rating) : null,
            guest_rating: d.guest_rating ?? 0,
          },
        });
      }

      // 3. amenities
      if (updates.amenities) {
        await tx.hotel_amenities.deleteMany({ where: { hotel_id: hotelId } });
        const rows: any[] = [];
        for (const name of updates.amenities) {
          const amen = await tx.amenities.findUnique({ where: { name } });
          if (amen) rows.push({ hotel_id: hotelId, amenity_id: amen.id });
        }
        if (rows.length) await tx.hotel_amenities.createMany({ data: rows });
      }

      // 4. images
      if (updates.images && Array.isArray(updates.images)) {
        console.log("Processing images update:", updates.images.length, "images");
        await tx.hotel_images.deleteMany({ where: { hotel_id: hotelId } });
        
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
        const imagesToSave = updates.images.slice(0, 8).map((img: any, index: number) => {
          let imageUrl: string;
          
          if (typeof img === "string") {
            imageUrl = img;
          } else if (img && typeof img === "object" && img.image_url) {
            imageUrl = img.image_url;
          } else {
            return null; // Skip invalid images
          }

          return {
            hotel_id: hotelId,
            image_url: imageUrl,
            is_cover: index === coverImageIndex, // Only the selected index is cover
          };
        }).filter((img: any) => img !== null);

        console.log(`Setting image ${coverImageIndex} as cover. Total images: ${imagesToSave.length}`);
        console.log("Final images to save:", imagesToSave.map((img: any) => ({ url_length: img.image_url.length, is_cover: img.is_cover })));
        
        if (imagesToSave.length) await tx.hotel_images.createMany({ data: imagesToSave });
      }

      // return full hotel
      return tx.hotels.findUnique({
        where: { hotel_id: hotelId },
        include: {
          hotel_details: true,
          hotel_amenities: { include: { amenity: true } },
          hotel_images: true,
        },
      });
    });

    return hotel;
  } catch (error) {
    console.error("Error in updateHotel:", error);
    throw error;
  }
}

/**
 * Changes hotel approval status
 *
 * WORKFLOW:
 * 1. Check if hotel exists
 * 2. Update approval_status
 * 3. Set published_at if status is PUBLISHED
 * 4. Set approved_by to the system admin approving it
 * 5. Return updated hotel
 *
 * @param {number} hotelId - Hotel ID
 * @param {string} status - New approval status (DRAFT, PENDING_APPROVAL, PUBLISHED, REJECTED)
 * @param {number} approvedBy - System admin ID approving the change (optional)
 * @returns {{hotel_id, approval_status, published_at}} Updated hotel status
 * @throws {Error} HOTEL_NOT_FOUND
 *
 * @example
 * const approved = await updateHotelApprovalStatus(5, "PUBLISHED", 1);
 */
export async function updateHotelApprovalStatus(
  hotelId: number,
  status: string,
  approvedBy?: number
) {
  // Check if hotel exists
  const existingHotel = await prisma.hotels.findUnique({
    where: { hotel_id: hotelId },
  });

  if (!existingHotel) {
    throw new Error("HOTEL_NOT_FOUND");
  }

  // Build update data
  const updateData: any = {
    approval_status: status,
  };

  if (status === "PUBLISHED" && !existingHotel.published_at) {
    updateData.published_at = new Date();
  }

  if (approvedBy) {
    updateData.approved_by = approvedBy;
  }

  const updated = await prisma.hotels.update({
    where: { hotel_id: hotelId },
    data: updateData,
    select: {
      hotel_id: true,
      approval_status: true,
      published_at: true,
      updated_at: true,
    },
  });

  return updated;
}

/**
 * Soft deletes a hotel
 *
 * WORKFLOW:
 * 1. Check if hotel exists
 * 2. Set deleted_at timestamp
 * 3. Return confirmation
 *
 * @param {number} hotelId - Hotel ID to delete
 * @returns {{message: string, hotel_id: number}} Deletion confirmation
 * @throws {Error} HOTEL_NOT_FOUND
 *
 * @example
 * const result = await deleteHotel(5);
 * console.log(result.message);
 */
export async function deleteHotel(hotelId: number) {
  // Check if hotel exists
  const existingHotel = await prisma.hotels.findUnique({
    where: { hotel_id: hotelId },
  });

  if (!existingHotel) {
    throw new Error("HOTEL_NOT_FOUND");
  }

  // Soft delete
  await prisma.hotels.update({
    where: { hotel_id: hotelId },
    data: { deleted_at: new Date() },
  });

  return {
    message: "Hotel deleted successfully",
    hotel_id: hotelId,
  };
}
