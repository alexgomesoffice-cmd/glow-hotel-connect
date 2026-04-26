/**
 * FILE: src/modules/rooms/rooms.routes.ts
 * PURPOSE: HTTP route definitions for room operations
 *
 * ROUTES:
 * POST /create - Create new room type (protected)
 * GET / - List rooms with filters and pagination (public)
 * GET /:id - Get single room details (public)
 * PUT /:id - Update room information (protected)
 * DELETE /:id - Delete room (protected)
 *
 * USAGE:
 * import roomsRouter from '@/modules/rooms/rooms.routes';
 * router.use('/rooms', roomsRouter);
 */

import { Router } from "express";
import { authenticate } from "@/middlewares/auth.middleware";
import {
  createRoomController,
  getRoomController,
  listRoomsController,
  updateRoomController,
  deleteRoomController,
  createRoomWithPhysicalRoomsController,
  addPhysicalRoomsController,
  getPhysicalRoomsController,
  updatePhysicalRoomController,
  deletePhysicalRoomController,
  getRoomInventoryController,
  getAmenitiesListController,
  getHotelPhysicalRoomsController,
} from "./rooms.controller";

const router = Router();

/**
 * GET /amenities/list
 * Get all available amenities
 * MUST be before /:id routes to avoid pattern matching
 * @returns {success, message, data: [{id, name, icon, context}, ...]}
 */
router.get("/amenities/list", getAmenitiesListController);

/**
 * POST /create
 * Create a new room type
 * @requires Authentication
 * @query {hotel_id}
 * @body {room_type, base_price, description?, room_size?}
 * @returns {hotel_room_id, hotel_id, room_type, base_price, created_at}
 */
router.post("/create", authenticate, createRoomController);

/**
 * GET /
 * List all room types for a hotel with filtering and pagination
 * @query {hotel_id, skip?, take?, room_type?}
 * @returns {rooms: [], total, skip, take}
 */
// Public endpoint: end-users (hotel detail pages) should be able to view rooms
// without providing an authorization header.
router.get("/", listRoomsController);

/**
 * GET /:id
 * Get room type details by ID
 * @param {id} Room ID
 * @returns {hotel_room_id, hotel_id, room_type, description, base_price, room_size, created_at, updated_at}
 */
router.get("/:id", authenticate, getRoomController);

/**
 * PUT /:id
 * Update room type information
 * @requires Authentication
 * @param {id} Room ID
 * @body {room_type?, base_price?, description?, room_size?}
 * @returns {hotel_room_id, room_type, base_price, updated_at}
 */
router.put("/:id", authenticate, updateRoomController);

/**
 * DELETE /:id
 * Delete room type
 * @requires Authentication
 * @param {id} Room ID
 * @returns {message, hotel_room_id}
 */
router.delete("/:id", authenticate, deleteRoomController);

/**
 * POST /bulk-create
 * Create a room type with multiple physical rooms in one transaction
 * @requires Authentication
 * @query {hotel_id}
 * @body {room_data: {room_type, base_price, description?, room_size?}, room_numbers: [{room_number, bed_type?, max_occupancy?, ...}, ...]}
 * @returns {room: {...}, physical_rooms: [...], count}
 */
router.post("/bulk-create", authenticate, createRoomWithPhysicalRoomsController);

/**
 * POST /:roomId/physical-rooms
 * Add more physical rooms to an existing room type
 * @requires Authentication
 * @param {roomId} Room type ID
 * @body {room_numbers: [{room_number, bed_type?, max_occupancy?, ...}, ...]}
 * @returns {room_id, added_rooms: [...], count}
 */
router.post("/:roomId/physical-rooms", authenticate, addPhysicalRoomsController);

/**
 * GET /:roomId/physical-rooms
 * List all physical rooms for a room type
 * @param {roomId} Room type ID
 * @query {skip?, take?}
 * @returns {room_id, total, rooms: [...], skip, take}
 */
router.get("/:roomId/physical-rooms", authenticate, getPhysicalRoomsController);

/**
 * PUT /:roomId/physical-rooms/:detailId
 * Update a physical room's details
 * @requires Authentication
 * @param {roomId} Room type ID
 * @param {detailId} Physical room details ID
 * @body {room_number?, bed_type?, max_occupancy?, smoking_allowed?, pet_allowed?, image_url?}
 * @returns {hotel_room_details_id, room_number, bed_type, max_occupancy, updated_at}
 */
router.put("/:roomId/physical-rooms/:detailId", authenticate, updatePhysicalRoomController);

/**
 * DELETE /:roomId/physical-rooms/:detailId
 * Soft delete a physical room
 * @requires Authentication
 * @param {roomId} Room type ID
 * @param {detailId} Physical room details ID
 * @returns {message, hotel_room_details_id}
 */
router.delete("/:roomId/physical-rooms/:detailId", authenticate, deletePhysicalRoomController);

/**
 * GET /:roomId/inventory
 * Get inventory count for a room type
 * @param {roomId} Room type ID
 * @returns {room_id, total_rooms, active_rooms, deleted_rooms}
 */
router.get("/:roomId/inventory", authenticate, getRoomInventoryController);

export default router;
