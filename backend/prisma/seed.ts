import { PrismaClient, AmenityContext, ApprovalStatus, BookingStatus, TrackerStatus, BedType, HotelType, RoomType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Running seed script...");

  // roles
  const hotelAdminRole = await prisma.roles.upsert({
    where: { role_name: "HOTEL_ADMIN" },
    update: {},
    create: { role_name: "HOTEL_ADMIN" },
  });

  const hotelSubAdminRole = await prisma.roles.upsert({
    where: { role_name: "HOTEL_SUB_ADMIN" },
    update: {},
    create: { role_name: "HOTEL_SUB_ADMIN" },
  });

  // system admin
  const sysAdmin = await prisma.system_admins.upsert({
    where: { email: "admin@myhotels.com" },
    update: {},
    create: {
      name: "System Administrator",
      email: "admin@myhotels.com",
      password: "admin123", // production should hash
      is_active: true,
      is_blocked: false,
    },
  });

  // system admin details
  await prisma.system_admin_details.upsert({
    where: { system_admin_id: sysAdmin.system_admin_id },
    update: {},
    create: {
      system_admin_id: sysAdmin.system_admin_id,
      address: "123 Main St, Dhaka",
      phone: "+8801234567890",
    },
  });

  // amenities master list
  const amenitiesData = [
    // Hotel amenities
    { name: "Swimming Pool", context: AmenityContext.HOTEL, icon: "pool" },
    { name: "Gym / Fitness Center", context: AmenityContext.HOTEL, icon: "fitness" },
    { name: "Free Wi-Fi", context: AmenityContext.HOTEL, icon: "wifi" },
    { name: "Parking", context: AmenityContext.HOTEL, icon: "parking" },
    { name: "Restaurant", context: AmenityContext.HOTEL, icon: "restaurant" },
    { name: "24/7 Front Desk", context: AmenityContext.HOTEL, icon: "desk" },
    { name: "CCTV Security", context: AmenityContext.HOTEL, icon: "security" },
    { name: "Wheelchair Accessible", context: AmenityContext.HOTEL, icon: "wheelchair" },
    { name: "Pet Friendly", context: AmenityContext.HOTEL, icon: "pets" },
    { name: "Air Conditioning", context: AmenityContext.HOTEL, icon: "ac" },
    
    // Room amenities
    { name: "High Quality Bedding", context: AmenityContext.ROOM, icon: "bedding" },
    { name: "Private Bathroom", context: AmenityContext.ROOM, icon: "bathroom" },
    { name: "Air Conditioner", context: AmenityContext.ROOM, icon: "ac" },
    { name: "Non-Air Conditioner", context: AmenityContext.ROOM, icon: "fan" },
    { name: "Heater", context: AmenityContext.ROOM, icon: "heater" },
    { name: "Coffee/Tea Maker", context: AmenityContext.ROOM, icon: "coffee" },
    { name: "Mini Bar/Refrigerator", context: AmenityContext.ROOM, icon: "minibar" },
    { name: "Security Deposit Box", context: AmenityContext.ROOM, icon: "safe" },
    { name: "Hair Dryer", context: AmenityContext.ROOM, icon: "hairdryer" },
    { name: "Iron & Iron Board", context: AmenityContext.ROOM, icon: "iron" },
    { name: "Working Desk & Ergonomic Chair", context: AmenityContext.ROOM, icon: "desk" },
  ];

  for (const amenity of amenitiesData) {
    await prisma.amenities.upsert({
      where: { name: amenity.name },
      update: {},
      create: amenity,
    });
  }

  // Seed Bangladesh cities (8 divisions)
  const citiesData = [
    {
      name: "Dhaka",
      image_url: "Cities/dhaka.png",
    },
    {
      name: "Chittagong",
      image_url: "Cities/chittagong.png",
    },
    {
      name: "Khulna",
      image_url: "Cities/khulna.png",
    },
    {
      name: "Rajshahi",
      image_url: "Cities/rajshahi.png",
    },
    {
      name: "Sylhet",
      image_url: "Cities/sylhet.png",
    },
    {
      name: "Rangpur",
      image_url: "Cities/rangpur.png",
    },
    {
      name: "Barisal",
      image_url: "Cities/barishal.png",
    },
    {
      name: "Mymensingh",
      image_url: "Cities/mym.png",
    },
  ];

  for (const city of citiesData) {
    // First delete existing city to force update with new image
    await prisma.cities.deleteMany({
      where: { name: city.name },
    });
    
    // Then create with new image URL
    await prisma.cities.create({
      data: city,
    });
  }

  // hotels + details + images + amenities
  const hotelsSeed = [
    {
      name: "Grand Stay Hotel",
      email: "contact@grandstay.com",
      city: "Dhaka",
      hotel_type: "hotel",
      emergency_contact1: "+880123000001",
      owner_name: "John Smith",
      zip_code: "1212",
      description: "A luxury 5-star hotel in the heart of Dhaka with world-class amenities",
      reception_no1: "+880123000002",
      reception_no2: "+880123000003",
      star_rating: 5,
      guest_rating: 4.8,
      amenities: [
        "Swimming Pool",
        "Gym / Fitness Center",
        "Free Wi-Fi",
        "Parking",
      ],
      images: [
        "https://example.com/images/grand1.jpg",
        "https://example.com/images/grand2.jpg",
      ],
      hotelAdmin: {
        name: "Grand Manager",
        email: "manager@grandstay.com",
        password: "hotel123",
        phone: "+880123000004",
      },
    },
    // more hotels if desired
  ];

  for (const hotelData of hotelsSeed) {
    // identify hotel by name+city combination; upgrade if existing
    let hotel = await prisma.hotels.findFirst({
      where: {
        name: hotelData.name,
        city: hotelData.city,
      },
    });

    if (!hotel) {
      hotel = await prisma.hotels.create({
        data: {
          name: hotelData.name,
          email: hotelData.email || null,
          city: hotelData.city || null,
          hotel_type: (hotelData.hotel_type as HotelType) || null,
          emergency_contact1: hotelData.emergency_contact1 || null,
          owner_name: hotelData.owner_name || null,
          zip_code: hotelData.zip_code || null,
          created_by: sysAdmin.system_admin_id,
          approval_status: ApprovalStatus.PUBLISHED,
          published_at: new Date(),
        },
      });
    }

    // hotel_details
    await prisma.hotel_details.upsert({
      where: { hotel_id: hotel.hotel_id },
      update: {
        description: hotelData.description,
        reception_no1: hotelData.reception_no1,
        reception_no2: hotelData.reception_no2,
        star_rating: hotelData.star_rating,
        guest_rating: hotelData.guest_rating,
      },
      create: {
        hotel_id: hotel.hotel_id,
        description: hotelData.description,
        reception_no1: hotelData.reception_no1,
        reception_no2: hotelData.reception_no2,
        star_rating: hotelData.star_rating,
        guest_rating: hotelData.guest_rating,
      },
    });

    // hotel_amenities junction
    for (const name of hotelData.amenities) {
      const amenity = await prisma.amenities.findUnique({ where: { name } });
      if (amenity) {
        await prisma.hotel_amenities.upsert({
          where: { hotel_id_amenity_id: { hotel_id: hotel.hotel_id, amenity_id: amenity.id } },
          update: {},
          create: { hotel_id: hotel.hotel_id, amenity_id: amenity.id },
        });
      }
    }

    // hotel_images: only create if not already present
    for (const url of hotelData.images) {
      const existingImg = await prisma.hotel_images.findFirst({
        where: { hotel_id: hotel.hotel_id, image_url: url },
      });
      if (!existingImg) {
        await prisma.hotel_images.create({
          data: { hotel_id: hotel.hotel_id, image_url: url },
        });
      }
    }

    // hotel admin
    const admin = await prisma.hotel_admins.upsert({
      where: { email: hotelData.hotelAdmin.email },
      update: {},
      create: {
        name: hotelData.hotelAdmin.name,
        email: hotelData.hotelAdmin.email,
        password: hotelData.hotelAdmin.password,
        hotel_id: hotel.hotel_id,
        role_id: hotelAdminRole.role_id,
        created_by: sysAdmin.system_admin_id,
      },
    });

    await prisma.hotel_admin_details.upsert({
      where: { hotel_admin_id: admin.hotel_admin_id },
      update: { phone: hotelData.hotelAdmin.phone },
      create: { hotel_admin_id: admin.hotel_admin_id, phone: hotelData.hotelAdmin.phone },
    });
  }

  // ROOMS DATA
  // Get the first hotel created (Grand Stay Hotel)
  const grandStayHotel = await prisma.hotels.findFirst({
    where: { name: "Grand Stay Hotel" },
  });

  if (grandStayHotel) {
    // Create room types
    const roomTypes = [
      { room_type: "delux", base_price: 150.50, description: "Spacious room with queen bed and city view" },
      { room_type: "standard", base_price: 95.00, description: "Compact room, perfect for business travelers" },
      { room_type: "suite", base_price: 299.99, description: "Premium suite with separate living area and marble bathroom" },
      { room_type: "standard", base_price: 75.00, description: "Budget-friendly room" },
    ];

    for (const roomData of roomTypes) {
      let roomType = await prisma.hotel_rooms.findFirst({
        where: {
          hotel_id: grandStayHotel.hotel_id,
          room_type: roomData.room_type as RoomType,
        },
      });

      if (!roomType) {
        roomType = await prisma.hotel_rooms.create({
          data: {
            hotel_id: grandStayHotel.hotel_id,
            room_type: roomData.room_type as RoomType,
            base_price: roomData.base_price,
            description: roomData.description,
          },
        });
      }

      // Create physical rooms for each room type - use different room numbers for each type
      const startNum = roomTypes.indexOf(roomData) * 100 + 101;
      const physicalRooms = [
        { room_number: String(startNum), bed_type: "Queen" as BedType, max_occupancy: 2, status: "AVAILABLE" as const },
        { room_number: String(startNum + 1), bed_type: "Queen" as BedType, max_occupancy: 2, status: "AVAILABLE" as const },
        { room_number: String(startNum + 2), bed_type: "Queen" as BedType, max_occupancy: 2, status: "UNAVAILABLE" as const },
        { room_number: String(startNum + 3), bed_type: "Queen" as BedType, max_occupancy: 2, status: "MAINTENANCE" as const },
        { room_number: String(startNum + 4), bed_type: "Queen" as BedType, max_occupancy: 2, status: "AVAILABLE" as const },
      ];

      for (const pr of physicalRooms) {
        const existingRoom = await prisma.hotel_room_details.findFirst({
          where: {
            hotel_rooms_id: roomType.hotel_room_id,
            room_number: pr.room_number,
          },
        });

        if (!existingRoom) {
          await prisma.hotel_room_details.create({
            data: {
              hotel_rooms_id: roomType.hotel_room_id,
              room_number: pr.room_number,
              bed_type: pr.bed_type as BedType,
              max_occupancy: pr.max_occupancy,
              smoking_allowed: Math.random() > 0.5,
              pet_allowed: Math.random() > 0.5,
              status: pr.status,
            },
          });
        }
      }
    }
  }

  // END USERS
  const users = [
    { name: "Alice Johnson", email: "alice@example.com" },
    { name: "Bob Wilson", email: "bob@example.com" },
    { name: "Carol Davis", email: "carol@example.com" },
    { name: "David Brown", email: "david@example.com" },
  ];

  for (const u of users) {
    const user = await prisma.end_users.upsert({
      where: { email: u.email },
      update: {},
      create: {
        name: u.name,
        email: u.email,
        password: "password123",
      },
    });

    await prisma.end_user_details.upsert({
      where: { end_user_id: user.end_user_id },
      update: {},
      create: { 
        end_user_id: user.end_user_id, 
        phone: `+88010000${String(user.end_user_id).padStart(4, '0')}`,
      },
    });
  }

  console.log("Seeding finished with all dummy data!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
