import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const hotelTypes = await prisma.hotels.findMany({
    where: { deleted_at: null, hotel_type: { not: null } },
    distinct: ["hotel_type"],
    select: { hotel_type: true },
  });

  const roomTypes = await prisma.hotel_rooms.findMany({
    distinct: ["room_type"],
    select: { room_type: true },
  });

  const bedTypes = await prisma.hotel_room_details.findMany({
    where: { deleted_at: null, bed_type: { not: null } },
    distinct: ["bed_type"],
    select: { bed_type: true },
  });

  console.log("Distinct hotel_type values:", hotelTypes.map((x) => x.hotel_type));
  console.log("Distinct room_type values:", roomTypes.map((x) => x.room_type));
  console.log("Distinct bed_type values:", bedTypes.map((x) => x.bed_type));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

