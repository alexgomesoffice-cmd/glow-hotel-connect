import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const listCities = async () => {
  return await prisma.cities.findMany({
    select: {
      id: true,
      name: true,
      image_url: true,
    },
    orderBy: {
      name: "asc",
    },
  });
};

export const getCitiesByDestination = async () => {
  return await prisma.cities.findMany({
    select: {
      id: true,
      name: true,
      image_url: true,
    },
    orderBy: {
      name: "asc",
    },
  });
};
