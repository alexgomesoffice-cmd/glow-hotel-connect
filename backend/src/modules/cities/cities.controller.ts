import type { Request, Response } from "express";
import { listCities, getCitiesByDestination } from "./cities.service";

export const listCitiesController = async (req: Request, res: Response) => {
  try {
    const cities = await listCities();
    res.status(200).json({
      success: true,
      data: cities,
    });
  } catch (error) {
    console.error("Error fetching cities:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch cities",
    });
  }
};

export const getCitiesByDestinationController = async (
  req: Request,
  res: Response
) => {
  try {
    const cities = await getCitiesByDestination();
    res.status(200).json({
      success: true,
      data: cities,
    });
  } catch (error) {
    console.error("Error fetching destination cities:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch destination cities",
    });
  }
};
