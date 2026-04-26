import { Router } from "express";
import {
  listCitiesController,
  getCitiesByDestinationController,
} from "./cities.controller";

const router = Router();

router.get("/", listCitiesController);
router.get("/destinations", getCitiesByDestinationController);

export default router;
