import { Router } from "express";
import {
  listBedTypesController,
  listHotelTypesController,
  listRoomTypesController,
  listSearchSuggestionsController,
} from "./hotels.controller";

const router = Router();

router.get("/hotel-types", listHotelTypesController);
router.get("/room-types", listRoomTypesController);
router.get("/bed-types", listBedTypesController);
router.get("/search-suggestions", listSearchSuggestionsController);

export default router;

