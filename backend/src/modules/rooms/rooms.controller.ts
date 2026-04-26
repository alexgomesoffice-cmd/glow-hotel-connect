/**
 * FILE: src/modules/rooms/rooms.controller.ts
 * PURPOSE: HTTP request/response handlers for room operations
 *
 * WHAT IT DOES:
 * - Handles POST /create to create new room type
 * - Handles GET /:id to retrieve room details
 * - Handles GET / to list rooms with filters
 * - Handles PUT /:id to update room info
 * - Handles PUT /:id/approval to change approval status
 * - Handles DELETE /:id to delete room type
 *
 * USAGE:
 * import { createRoomController, getRoomController } from './rooms.controller';
 * router.post('/create', authenticate, createRoomController);
 * router.get('/:id', getRoomController);
 */

import type { Request, Response, NextFunction } from "express";
import { prisma } from "@/config/prisma";
import {
  createRoom,
  getRoom,
  listRooms,
  updateRoom,
  deleteRoom,
  createRoomWithPhysicalRooms,
  addPhysicalRooms,
  getPhysicalRooms,
  updatePhysicalRoom,
  deletePhysicalRoom,
  getRoomInventory,
  getHotelPhysicalRooms,
} from "./rooms.service";
import {
  validateCreateRoomInput,
  validateUpdateRoomInput,
  validateRoomId,
  validateApprovalStatus,
  validatePhysicalRoomInput,
  validateBulkPhysicalRoomsInput,
  validateCreateRoomWithPhysicalRooms,
} from "./rooms.validation";
import { getHotelAdminAssignedHotel } from "../hotels/hotelAdmin.service";

/**
 * Handles POST /api/rooms/create request
 *
 * REQUIRES: Authentication (hotel admin or above)
 *
 * QUERY PARAMS:
 * hotel_id - Hotel ID to create room for
 *
 * REQUEST BODY:
 * {
 *   "room_type": "Deluxe Double",
 *   "base_price": 150.50,
 *   "description": "Spacious room with queen bed",
 *   "room_size": "40m²"
 * }
 *
 * @async
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {void}
 */
export async function createRoomController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Check authentication
    if (!req.actor) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
        error: { code: "UNAUTHORIZED" },
      });
      return;
    }

    const hotelId = parseInt((req.query.hotel_id as string) || "0", 10);
    const { images, ...roomData } = req.body;

    // Validate hotel ID
    if (!hotelId || hotelId <= 0) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        error: { code: "VALIDATION_ERROR", details: ["hotel_id is required and must be > 0"] },
      });
      return;
    }

    // Authorization check
    if (req.actor.role === "SYSTEM_ADMIN") {
      // System admins can create rooms for any hotel
    } else if (req.actor.role === "HOTEL_ADMIN") {
      // Hotel admins can only create rooms for their assigned hotel
      try {
        const assignedHotel = await getHotelAdminAssignedHotel(req.actor.id);
        if (assignedHotel.hotel_id !== hotelId) {
          res.status(403).json({
            success: false,
            message: "You can only create rooms for your assigned hotel",
            error: { code: "FORBIDDEN" },
          });
          return;
        }
      } catch (authError: any) {
        if (authError.message === "ADMIN_NOT_FOUND" || authError.message === "HOTEL_NOT_FOUND") {
          res.status(403).json({
            success: false,
            message: "Hotel admin not found or not assigned to a hotel",
            error: { code: "FORBIDDEN" },
          });
          return;
        }
        throw authError; // Re-throw unexpected errors
      }
    } else {
      // Other roles cannot create rooms
      res.status(403).json({
        success: false,
        message: "Insufficient permissions",
        error: { code: "FORBIDDEN" },
      });
      return;
    }

    // Validate input
    const validation = validateCreateRoomInput(roomData);
    if (!validation.isValid) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        error: { code: "VALIDATION_ERROR", details: validation.errors },
      });
      return;
    }

    // Call service
    const room = await createRoom(roomData, hotelId, images);

    // Return success
    res.status(201).json({
      success: true,
      message: "Room created successfully",
      data: room,
    });
  } catch (error: any) {
    // Handle service errors
    if (error.message === "HOTEL_NOT_FOUND") {
      res.status(404).json({
        success: false,
        message: "Hotel not found",
        error: { code: "HOTEL_NOT_FOUND" },
      });
      return;
    }

    // Unexpected error
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: { code: "SERVER_ERROR" },
    });
  }
}

/**
 * Handles GET /api/rooms/:id request
 *
 * URL PARAMS:
 * id - Room ID
 *
 * @async
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {void}
 */
export async function getRoomController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const roomId = parseInt((req.params.id as string) || "0", 10);

    // Validate room ID
    const validation = validateRoomId(roomId);
    if (!validation.isValid) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        error: { code: "VALIDATION_ERROR", details: validation.errors },
      });
      return;
    }

    // Call service
    const room = await getRoom(roomId);

    // Return success
    res.status(200).json({
      success: true,
      message: "Room retrieved successfully",
      data: room,
    });
  } catch (error: any) {
    // Handle service errors
    if (error.message === "ROOM_NOT_FOUND") {
      res.status(404).json({
        success: false,
        message: "Room not found",
        error: { code: "ROOM_NOT_FOUND" },
      });
      return;
    }

    // Unexpected error
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: { code: "SERVER_ERROR" },
    });
  }
}

/**
 * Handles GET /api/rooms request
 *
 * QUERY PARAMS:
 * hotel_id - Hotel ID (required)
 * skip - Records to skip (default: 0)
 * take - Records to return (default: 10, max: 100)
 * approval_status - Filter by status (PENDING, APPROVED, REJECTED)
 * room_type - Filter by room type name (contains)
 *
 * @async
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {void}
 */
export async function listRoomsController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const hotelId = parseInt((req.query.hotel_id as string) || "0", 10);

    // Validate hotel ID
    if (!hotelId || hotelId <= 0) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        error: { code: "VALIDATION_ERROR", details: ["hotel_id is required and must be > 0"] },
      });
      return;
    }

    // Parse pagination
    const skip = Math.max(0, parseInt(req.query.skip as string) || 0);
    const take = Math.min(100, Math.max(1, parseInt(req.query.take as string) || 10));

    // Parse filters
    const filters: any = {};
    if (req.query.approval_status) filters.approval_status = req.query.approval_status;
    if (req.query.room_type) {
      const raw = String(req.query.room_type);
      const normalized = raw.trim().toLowerCase();

      // Normalize legacy UI/text into the canonical enum values.
      // Canonical values after schema migration:
      // - standard, delux, suite, penthouse
      if (normalized === "delux" || normalized === "deluxe" || normalized.includes("deluxe")) {
        filters.room_type = "delux";
      } else if (normalized.includes("standard") || normalized === "standard") {
        filters.room_type = "standard";
      } else if (normalized.includes("suite") || normalized === "suite") {
        filters.room_type = "suite";
      } else if (normalized.includes("penthouse") || normalized === "penthouse") {
        filters.room_type = "penthouse";
      } else {
        // Best-effort: try using the normalized value directly.
        filters.room_type = normalized;
      }
    }

    // Call service
    const result = await listRooms(hotelId, filters, skip, take);

    // Return success
    res.status(200).json({
      success: true,
      message: "Rooms retrieved successfully",
      data: result,
    });
  } catch (error: any) {
    // Unexpected error
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: { code: "SERVER_ERROR" },
    });
  }
}

/**
 * Handles PUT /api/rooms/:id request
 *
 * REQUIRES: Authentication (hotel admin or above)
 *
 * URL PARAMS:
 * id - Room ID
 *
 * REQUEST BODY:
 * {
 *   "base_price": 175.00,
 *   "description": "Updated description"
 * }
 *
 * @async
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {void}
 */
export async function updateRoomController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Check authentication
    if (!req.actor) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
        error: { code: "UNAUTHORIZED" },
      });
      return;
    }

    const roomId = parseInt((req.params.id as string) || "0", 10);

    // Validate room ID
    const idValidation = validateRoomId(roomId);
    if (!idValidation.isValid) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        error: { code: "VALIDATION_ERROR", details: idValidation.errors },
      });
      return;
    }

    // Get room details to check hotel ownership
    const room = await prisma.hotel_rooms.findUnique({
      where: { hotel_room_id: roomId },
      select: { hotel_id: true },
    });

    if (!room) {
      res.status(404).json({
        success: false,
        message: "Room not found",
        error: { code: "ROOM_NOT_FOUND" },
      });
      return;
    }

    // Authorization check
    if (req.actor.role === "SYSTEM_ADMIN") {
      // System admins can update rooms for any hotel
    } else if (req.actor.role === "HOTEL_ADMIN") {
      // Hotel admins can only update rooms for their assigned hotel
      try {
        const assignedHotel = await getHotelAdminAssignedHotel(req.actor.id);
        if (assignedHotel.hotel_id !== room.hotel_id) {
          res.status(403).json({
            success: false,
            message: "You can only update rooms for your assigned hotel",
            error: { code: "FORBIDDEN" },
          });
          return;
        }
      } catch (authError: any) {
        if (authError.message === "ADMIN_NOT_FOUND" || authError.message === "HOTEL_NOT_FOUND") {
          res.status(403).json({
            success: false,
            message: "Hotel admin not found or not assigned to a hotel",
            error: { code: "FORBIDDEN" },
          });
          return;
        }
        throw authError; // Re-throw unexpected errors
      }
    } else {
      // Other roles cannot update rooms
      res.status(403).json({
        success: false,
        message: "Insufficient permissions",
        error: { code: "FORBIDDEN" },
      });
      return;
    }

    // Log incoming request for debugging
    console.log("updateRoomController - Request body:", {
      room_type: req.body.room_type,
      base_price: req.body.base_price,
      amenities: req.body.amenities,
      amenitiesCount: req.body.amenities ? req.body.amenities.length : 0,
      imagesCount: req.body.images ? req.body.images.length : 0,
    });
    
    // Detailed logging for debugging
    if (req.body.images && req.body.images.length > 0) {
      console.log(`First image type: ${typeof req.body.images[0]}`);
      console.log(`First image preview: ${String(req.body.images[0]).substring(0, 150)}`);
    }
    if (req.body.amenities && req.body.amenities.length > 0) {
      console.log(`Amenities array: [${req.body.amenities.map((a: any) => `${a}(${typeof a})`).join(", ")}]`);
    }

    // Validate update data
    const dataValidation = validateUpdateRoomInput(req.body);
    if (!dataValidation.isValid) {
      console.error("Validation errors:", dataValidation.errors);
      console.error("Full request body for validation:", JSON.stringify(req.body, null, 2));
      res.status(400).json({
        success: false,
        message: "Validation failed",
        error: { code: "VALIDATION_ERROR", details: dataValidation.errors },
      });
      return;
    }

    // Call service
    const updated = await updateRoom(roomId, req.body);

    // Return success
    res.status(200).json({
      success: true,
      message: "Room updated successfully",
      data: updated,
    });
  } catch (error: any) {
    // Log error for debugging
    console.error("updateRoomController error:", error);

    // Handle service errors
    if (error.message === "ROOM_NOT_FOUND") {
      res.status(404).json({
        success: false,
        message: "Room not found",
        error: { code: "ROOM_NOT_FOUND" },
      });
      return;
    }

    // Unexpected error
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: { code: "SERVER_ERROR", details: error.message },
    });
  }
}

/**
 * Handles PUT /api/rooms/:id/approval request
 *
 * REQUIRES: Authentication (system admin or above)
 *
 * URL PARAMS:
 * id - Room ID
 *
 * REQUEST BODY:
 * {
 *   "room_type": "Deluxe"
 * }
 *
 * @async
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {void}
 */

/**
 * Handles DELETE /api/rooms/:id request
 *
 * REQUIRES: Authentication (hotel admin or above)
 *
 * URL PARAMS:
 * id - Room ID to delete
 *
 * @async
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {void}
 */
export async function deleteRoomController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Check authentication
    if (!req.actor) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
        error: { code: "UNAUTHORIZED" },
      });
      return;
    }

    const roomId = parseInt((req.params.id as string) || "0", 10);

    // Validate room ID
    const validation = validateRoomId(roomId);
    if (!validation.isValid) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        error: { code: "VALIDATION_ERROR", details: validation.errors },
      });
      return;
    }

    // Get room details to check hotel ownership
    const room = await prisma.hotel_rooms.findUnique({
      where: { hotel_room_id: roomId },
      select: { hotel_id: true },
    });

    if (!room) {
      res.status(404).json({
        success: false,
        message: "Room not found",
        error: { code: "ROOM_NOT_FOUND" },
      });
      return;
    }

    // Authorization check
    if (req.actor.role === "SYSTEM_ADMIN") {
      // System admins can delete rooms for any hotel
    } else if (req.actor.role === "HOTEL_ADMIN") {
      // Hotel admins can only delete rooms for their assigned hotel
      try {
        const assignedHotel = await getHotelAdminAssignedHotel(req.actor.id);
        if (assignedHotel.hotel_id !== room.hotel_id) {
          res.status(403).json({
            success: false,
            message: "You can only delete rooms for your assigned hotel",
            error: { code: "FORBIDDEN" },
          });
          return;
        }
      } catch (authError: any) {
        if (authError.message === "ADMIN_NOT_FOUND" || authError.message === "HOTEL_NOT_FOUND") {
          res.status(403).json({
            success: false,
            message: "Hotel admin not found or not assigned to a hotel",
            error: { code: "FORBIDDEN" },
          });
          return;
        }
        throw authError; // Re-throw unexpected errors
      }
    } else {
      // Other roles cannot delete rooms
      res.status(403).json({
        success: false,
        message: "Insufficient permissions",
        error: { code: "FORBIDDEN" },
      });
      return;
    }

    // Call service
    const result = await deleteRoom(roomId);

    // Return success
    res.status(200).json({
      success: true,
      message: result.message,
      data: { hotel_room_id: result.hotel_room_id },
    });
  } catch (error: any) {
    // Handle service errors
    if (error.message === "ROOM_NOT_FOUND") {
      res.status(404).json({
        success: false,
        message: "Room not found",
        error: { code: "ROOM_NOT_FOUND" },
      });
      return;
    }

    // Unexpected error
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: { code: "SERVER_ERROR" },
    });
  }
}

/**
 * Handles POST /api/rooms/bulk-create request
 * Creates a room type and multiple physical rooms in one transaction
 *
 * REQUIRES: Authentication (hotel admin)
 *
 * QUERY PARAMS:
 * hotel_id - Hotel ID
 *
 * REQUEST BODY:
 * {
 *   "room_data": {
 *     "room_type": "Deluxe Double",
 *     "base_price": 150.50,
 *     "description": "Spacious room with queen bed",
 *     "room_size": "40m²"
 *   },
 *   "room_numbers": [
 *     { "room_number": "101", "bed_type": "Queen", "max_occupancy": 2 },
 *     { "room_number": "102", "bed_type": "Queen", "max_occupancy": 2 },
 *     { "room_number": "103", "bed_type": "Queen", "max_occupancy": 2 }
 *   ]
 * }
 *
 * @async
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {void}
 */
export async function createRoomWithPhysicalRoomsController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Check authentication
    if (!req.actor) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
        error: { code: "UNAUTHORIZED" },
      });
      return;
    }

    const hotelId = parseInt((req.query.hotel_id as string) || "0", 10);
    const { room_data, room_numbers, images } = req.body;

    // Validate hotel ID
    if (!hotelId || hotelId <= 0) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        error: { code: "VALIDATION_ERROR", details: ["hotel_id is required and must be > 0"] },
      });
      return;
    }

    // Authorization check
    if (req.actor.role === "SYSTEM_ADMIN") {
      // System admins can create rooms for any hotel
    } else if (req.actor.role === "HOTEL_ADMIN") {
      // Hotel admins can only create rooms for their assigned hotel
      try {
        const assignedHotel = await getHotelAdminAssignedHotel(req.actor.id);
        if (assignedHotel.hotel_id !== hotelId) {
          res.status(403).json({
            success: false,
            message: "You can only create rooms for your assigned hotel",
            error: { code: "FORBIDDEN" },
          });
          return;
        }
      } catch (authError: any) {
        if (authError.message === "ADMIN_NOT_FOUND" || authError.message === "HOTEL_NOT_FOUND") {
          res.status(403).json({
            success: false,
            message: "Hotel admin not found or not assigned to a hotel",
            error: { code: "FORBIDDEN" },
          });
          return;
        }
        throw authError; // Re-throw unexpected errors
      }
    } else {
      // Other roles cannot create rooms
      res.status(403).json({
        success: false,
        message: "Insufficient permissions",
        error: { code: "FORBIDDEN" },
      });
      return;
    }

    // Validate inputs
    const validation = validateCreateRoomWithPhysicalRooms(room_data, room_numbers);
    if (!validation.isValid) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        error: { code: "VALIDATION_ERROR", details: validation.errors },
      });
      return;
    }

    // Call service
    const result = await createRoomWithPhysicalRooms(room_data, room_numbers, hotelId, images);

    // Return success
    res.status(201).json({
      success: true,
      message: `Room type created with ${result.count} physical rooms`,
      data: result,
    });
  } catch (error: any) {
    // Handle service errors
    if (error.message === "HOTEL_NOT_FOUND") {
      res.status(404).json({
        success: false,
        message: "Hotel not found",
        error: { code: "HOTEL_NOT_FOUND" },
      });
      return;
    }

    if (error.message === "INVALID_ROOM_COUNT") {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        error: { code: "INVALID_ROOM_COUNT", details: ["At least 1 room is required"] },
      });
      return;
    }

    if (error.message === "DUPLICATE_ROOM_NUMBER_IN_REQUEST") {
      res.status(409).json({
        success: false,
        message: "Duplicate room numbers in request",
        error: { code: "DUPLICATE_ROOM_NUMBER", details: ["Room numbers must be unique within the request"] },
      });
      return;
    }

    if (error.message?.startsWith("DUPLICATE_ROOM_NUMBERS:")) {
      const numbers = error.message.replace("DUPLICATE_ROOM_NUMBERS:", "").trim();
      res.status(409).json({
        success: false,
        message: "Room numbers already exist for this room type",
        error: { code: "DUPLICATE_ROOM_NUMBERS", details: [`Room number(s) already exist for this room type: ${numbers}`] },
      });
      return;
    }

    if (error.message === "ROOM_TYPE_ALREADY_EXISTS") {
      res.status(409).json({
        success: false,
        message: "Room type already exists",
        error: { code: "ROOM_TYPE_ALREADY_EXISTS", details: ["A room type with this name already exists for this hotel"] },
      });
      return;
    }

    // Log the actual error for debugging
    console.error("createRoomWithPhysicalRoomsController error:", error);

    // Unexpected error
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: { code: "SERVER_ERROR" },
    });
  }
}

/**
 * Handles POST /api/rooms/:roomId/physical-rooms request
 * Adds more physical rooms to an existing room type
 *
 * REQUIRES: Authentication (hotel admin)
 *
 * URL PARAMS:
 * roomId - Room type ID
 *
 * REQUEST BODY:
 * {
 *   "room_numbers": [
 *     { "room_number": "104", "bed_type": "Queen", "max_occupancy": 2 },
 *     { "room_number": "105", "bed_type": "Queen", "max_occupancy": 2 }
 *   ]
 * }
 *
 * @async
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {void}
 */
export async function addPhysicalRoomsController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Check authentication
    if (!req.actor) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
        error: { code: "UNAUTHORIZED" },
      });
      return;
    }

    const roomId = parseInt((req.params.roomId as string) || "0", 10);
    const { room_numbers } = req.body;

    // Validate room ID
    const idValidation = validateRoomId(roomId);
    if (!idValidation.isValid) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        error: { code: "VALIDATION_ERROR", details: idValidation.errors },
      });
      return;
    }

    // Get room details to check hotel ownership
    const room = await prisma.hotel_rooms.findUnique({
      where: { hotel_room_id: roomId },
      select: { hotel_id: true },
    });

    if (!room) {
      res.status(404).json({
        success: false,
        message: "Room not found",
        error: { code: "ROOM_NOT_FOUND" },
      });
      return;
    }

    // Authorization check
    if (req.actor.role === "SYSTEM_ADMIN") {
      // System admins can modify rooms for any hotel
    } else if (req.actor.role === "HOTEL_ADMIN") {
      // Hotel admins can only modify rooms for their assigned hotel
      try {
        const assignedHotel = await getHotelAdminAssignedHotel(req.actor.id);
        if (assignedHotel.hotel_id !== room.hotel_id) {
          res.status(403).json({
            success: false,
            message: "You can only modify rooms for your assigned hotel",
            error: { code: "FORBIDDEN" },
          });
          return;
        }
      } catch (authError: any) {
        if (authError.message === "ADMIN_NOT_FOUND" || authError.message === "HOTEL_NOT_FOUND") {
          res.status(403).json({
            success: false,
            message: "Hotel admin not found or not assigned to a hotel",
            error: { code: "FORBIDDEN" },
          });
          return;
        }
        throw authError; // Re-throw unexpected errors
      }
    } else {
      // Other roles cannot modify rooms
      res.status(403).json({
        success: false,
        message: "Insufficient permissions",
        error: { code: "FORBIDDEN" },
      });
      return;
    }

    // Validate room numbers
    const roomValidation = validateBulkPhysicalRoomsInput(room_numbers);
    if (!roomValidation.isValid) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        error: { code: "VALIDATION_ERROR", details: roomValidation.errors },
      });
      return;
    }

    // Call service
    const result = await addPhysicalRooms(roomId, room_numbers);

    // Return success
    res.status(201).json({
      success: true,
      message: `${result.count} physical rooms added successfully`,
      data: result,
    });
  } catch (error: any) {
    // Handle service errors
    if (error.message === "ROOM_NOT_FOUND") {
      res.status(404).json({
        success: false,
        message: "Room not found",
        error: { code: "ROOM_NOT_FOUND" },
      });
      return;
    }

    if (error.message === "INVALID_ROOM_COUNT") {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        error: { code: "INVALID_ROOM_COUNT", details: ["At least 1 room is required"] },
      });
      return;
    }

    if (error.message.startsWith("DUPLICATE_ROOM_NUMBER")) {
      const roomNum = error.message.split(":")[1];
      res.status(409).json({
        success: false,
        message: "Duplicate room number",
        error: { code: "DUPLICATE_ROOM_NUMBER", details: [`Room number ${roomNum} already exists`] },
      });
      return;
    }

    // Unexpected error
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: { code: "SERVER_ERROR" },
    });
  }
}

/**
 * Handles GET /api/rooms/:roomId/physical-rooms request
 * Lists all physical rooms for a room type
 *
 * URL PARAMS:
 * roomId - Room type ID
 *
 * QUERY PARAMS:
 * skip - Pagination skip (default: 0)
 * take - Pagination take (default: 20, max: 100)
 *
 * @async
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {void}
 */
export async function getPhysicalRoomsController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Check authentication
    if (!req.actor) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
        error: { code: "UNAUTHORIZED" },
      });
      return;
    }

    const roomId = parseInt((req.params.roomId as string) || "0", 10);
    const skip = parseInt((req.query.skip as string) || "0", 10);
    const take = Math.min(parseInt((req.query.take as string) || "20", 10), 100);

    // Validate room ID
    const validation = validateRoomId(roomId);
    if (!validation.isValid) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        error: { code: "VALIDATION_ERROR", details: validation.errors },
      });
      return;
    }

    // Get room details to check hotel ownership
    const room = await prisma.hotel_rooms.findUnique({
      where: { hotel_room_id: roomId },
      select: { hotel_id: true },
    });

    if (!room) {
      res.status(404).json({
        success: false,
        message: "Room not found",
        error: { code: "ROOM_NOT_FOUND" },
      });
      return;
    }

    // Authorization check
    if (req.actor.role === "SYSTEM_ADMIN") {
      // System admins can view physical rooms for any hotel
    } else if (req.actor.role === "HOTEL_ADMIN") {
      // Hotel admins can only view physical rooms for their assigned hotel
      try {
        const assignedHotel = await getHotelAdminAssignedHotel(req.actor.id);
        if (assignedHotel.hotel_id !== room.hotel_id) {
          res.status(403).json({
            success: false,
            message: "You can only view physical rooms for your assigned hotel",
            error: { code: "FORBIDDEN" },
          });
          return;
        }
      } catch (authError: any) {
        if (authError.message === "ADMIN_NOT_FOUND" || authError.message === "HOTEL_NOT_FOUND") {
          res.status(403).json({
            success: false,
            message: "Hotel admin not found or not assigned to a hotel",
            error: { code: "FORBIDDEN" },
          });
          return;
        }
        throw authError; // Re-throw unexpected errors
      }
    } else {
      // Other roles cannot view physical rooms
      res.status(403).json({
        success: false,
        message: "Insufficient permissions",
        error: { code: "FORBIDDEN" },
      });
      return;
    }

    // Call service
    const result = await getPhysicalRooms(roomId, skip, take);

    // Return success
    res.status(200).json({
      success: true,
      message: "Physical rooms retrieved successfully",
      data: result,
    });
  } catch (error: any) {
    // Handle service errors
    if (error.message === "ROOM_NOT_FOUND") {
      res.status(404).json({
        success: false,
        message: "Room not found",
        error: { code: "ROOM_NOT_FOUND" },
      });
      return;
    }

    // Unexpected error
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: { code: "SERVER_ERROR" },
    });
  }
}

/**
 * Handles PUT /api/rooms/:roomId/physical-rooms/:detailId request
 * Updates a physical room's details
 *
 * REQUIRES: Authentication (hotel admin)
 *
 * URL PARAMS:
 * roomId - Room type ID
 * detailId - Physical room details ID
 *
 * REQUEST BODY:
 * {
 *   "room_number": "101A",
 *   "bed_type": "King",
 *   "max_occupancy": 3,
 *   "smoking_allowed": false,
 *   "pet_allowed": true
 * }
 *
 * @async
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {void}
 */
export async function updatePhysicalRoomController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Check authentication
    if (!req.actor) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
        error: { code: "UNAUTHORIZED" },
      });
      return;
    }

    const detailId = parseInt((req.params.detailId as string) || "0", 10);
    const updates = req.body;

    // Validate detail ID
    if (!detailId || detailId <= 0) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        error: { code: "VALIDATION_ERROR", details: ["detailId is required and must be > 0"] },
      });
      return;
    }

    // Get physical room details to check hotel ownership
    const physicalRoom = await prisma.hotel_room_details.findUnique({
      where: { hotel_room_details_id: detailId },
      include: {
        hotel_room: {
          select: { hotel_id: true },
        },
      },
    });

    if (!physicalRoom) {
      res.status(404).json({
        success: false,
        message: "Physical room not found",
        error: { code: "ROOM_NOT_FOUND" },
      });
      return;
    }

    // Authorization check
    if (req.actor.role === "SYSTEM_ADMIN") {
      // System admins can update physical rooms for any hotel
    } else if (req.actor.role === "HOTEL_ADMIN") {
      // Hotel admins can only update physical rooms for their assigned hotel
      try {
        const assignedHotel = await getHotelAdminAssignedHotel(req.actor.id);
        if (assignedHotel.hotel_id !== physicalRoom.hotel_room.hotel_id) {
          res.status(403).json({
            success: false,
            message: "You can only update physical rooms for your assigned hotel",
            error: { code: "FORBIDDEN" },
          });
          return;
        }
      } catch (authError: any) {
        if (authError.message === "ADMIN_NOT_FOUND" || authError.message === "HOTEL_NOT_FOUND") {
          res.status(403).json({
            success: false,
            message: "Hotel admin not found or not assigned to a hotel",
            error: { code: "FORBIDDEN" },
          });
          return;
        }
        throw authError; // Re-throw unexpected errors
      }
    } else {
      // Other roles cannot update physical rooms
      res.status(403).json({
        success: false,
        message: "Insufficient permissions",
        error: { code: "FORBIDDEN" },
      });
      return;
    }

    // Validate updates
    const updateValidation = validatePhysicalRoomInput(updates);
    if (!updateValidation.isValid && Object.keys(updates).length > 0) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        error: { code: "VALIDATION_ERROR", details: updateValidation.errors },
      });
      return;
    }

    // Call service
    const result = await updatePhysicalRoom(detailId, updates);

    // Return success
    res.status(200).json({
      success: true,
      message: "Physical room updated successfully",
      data: result,
    });
  } catch (error: any) {
    // Handle service errors
    if (error.message === "DETAIL_NOT_FOUND") {
      res.status(404).json({
        success: false,
        message: "Physical room not found",
        error: { code: "DETAIL_NOT_FOUND" },
      });
      return;
    }

    if (error.message === "DUPLICATE_ROOM_NUMBER") {
      res.status(409).json({
        success: false,
        message: "Room number already exists in this room type",
        error: { code: "DUPLICATE_ROOM_NUMBER" },
      });
      return;
    }

    // Unexpected error
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: { code: "SERVER_ERROR" },
    });
  }
}

/**
 * Handles DELETE /api/rooms/:roomId/physical-rooms/:detailId request
 * Soft deletes a physical room
 *
 * REQUIRES: Authentication (hotel admin)
 *
 * URL PARAMS:
 * roomId - Room type ID
 * detailId - Physical room details ID
 *
 * @async
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {void}
 */
export async function deletePhysicalRoomController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Check authentication
    if (!req.actor) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
        error: { code: "UNAUTHORIZED" },
      });
      return;
    }

    const detailId = parseInt((req.params.detailId as string) || "0", 10);

    // Validate detail ID
    if (!detailId || detailId <= 0) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        error: { code: "VALIDATION_ERROR", details: ["detailId is required and must be > 0"] },
      });
      return;
    }

    // Get physical room details to check hotel ownership
    const physicalRoom = await prisma.hotel_room_details.findUnique({
      where: { hotel_room_details_id: detailId },
      include: {
        hotel_room: {
          select: { hotel_id: true },
        },
      },
    });

    if (!physicalRoom) {
      res.status(404).json({
        success: false,
        message: "Physical room not found",
        error: { code: "ROOM_NOT_FOUND" },
      });
      return;
    }

    // Authorization check
    if (req.actor.role === "SYSTEM_ADMIN") {
      // System admins can delete physical rooms for any hotel
    } else if (req.actor.role === "HOTEL_ADMIN") {
      // Hotel admins can only delete physical rooms for their assigned hotel
      try {
        const assignedHotel = await getHotelAdminAssignedHotel(req.actor.id);
        if (assignedHotel.hotel_id !== physicalRoom.hotel_room.hotel_id) {
          res.status(403).json({
            success: false,
            message: "You can only delete physical rooms for your assigned hotel",
            error: { code: "FORBIDDEN" },
          });
          return;
        }
      } catch (authError: any) {
        if (authError.message === "ADMIN_NOT_FOUND" || authError.message === "HOTEL_NOT_FOUND") {
          res.status(403).json({
            success: false,
            message: "Hotel admin not found or not assigned to a hotel",
            error: { code: "FORBIDDEN" },
          });
          return;
        }
        throw authError; // Re-throw unexpected errors
      }
    } else {
      // Other roles cannot delete physical rooms
      res.status(403).json({
        success: false,
        message: "Insufficient permissions",
        error: { code: "FORBIDDEN" },
      });
      return;
    }

    // Call service
    const result = await deletePhysicalRoom(detailId);

    // Return success
    res.status(200).json({
      success: true,
      message: result.message,
      data: { hotel_room_details_id: result.hotel_room_details_id },
    });
  } catch (error: any) {
    // Handle service errors
    if (error.message === "DETAIL_NOT_FOUND") {
      res.status(404).json({
        success: false,
        message: "Physical room not found",
        error: { code: "DETAIL_NOT_FOUND" },
      });
      return;
    }

    // Unexpected error
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: { code: "SERVER_ERROR" },
    });
  }
}

/**
 * Handles GET /api/rooms/:roomId/inventory request
 * Gets inventory count for a room type
 *
 * URL PARAMS:
 * roomId - Room type ID
 *
 * @async
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {void}
 */
export async function getRoomInventoryController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Check authentication
    if (!req.actor) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
        error: { code: "UNAUTHORIZED" },
      });
      return;
    }

    const roomId = parseInt((req.params.roomId as string) || "0", 10);

    // Validate room ID
    const validation = validateRoomId(roomId);
    if (!validation.isValid) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        error: { code: "VALIDATION_ERROR", details: validation.errors },
      });
      return;
    }

    // Get room details to check hotel ownership
    const room = await prisma.hotel_rooms.findUnique({
      where: { hotel_room_id: roomId },
      select: { hotel_id: true },
    });

    if (!room) {
      res.status(404).json({
        success: false,
        message: "Room not found",
        error: { code: "ROOM_NOT_FOUND" },
      });
      return;
    }

    // Authorization check
    if (req.actor.role === "SYSTEM_ADMIN") {
      // System admins can view room inventory for any hotel
    } else if (req.actor.role === "HOTEL_ADMIN") {
      // Hotel admins can only view room inventory for their assigned hotel
      try {
        const assignedHotel = await getHotelAdminAssignedHotel(req.actor.id);
        if (assignedHotel.hotel_id !== room.hotel_id) {
          res.status(403).json({
            success: false,
            message: "You can only view room inventory for your assigned hotel",
            error: { code: "FORBIDDEN" },
          });
          return;
        }
      } catch (authError: any) {
        if (authError.message === "ADMIN_NOT_FOUND" || authError.message === "HOTEL_NOT_FOUND") {
          res.status(403).json({
            success: false,
            message: "Hotel admin not found or not assigned to a hotel",
            error: { code: "FORBIDDEN" },
          });
          return;
        }
        throw authError; // Re-throw unexpected errors
      }
    } else {
      // Other roles cannot view room inventory
      res.status(403).json({
        success: false,
        message: "Insufficient permissions",
        error: { code: "FORBIDDEN" },
      });
      return;
    }

    // Call service
    const result = await getRoomInventory(roomId);

    // Return success
    res.status(200).json({
      success: true,
      message: "Room inventory retrieved successfully",
      data: result,
    });
  } catch (error: any) {
    // Handle service errors
    if (error.message === "ROOM_NOT_FOUND") {
      res.status(404).json({
        success: false,
        message: "Room not found",
        error: { code: "ROOM_NOT_FOUND" },
      });
      return;
    }

    // Unexpected error
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: { code: "SERVER_ERROR" },
    });
  }
}

/**
 * Handles GET /api/rooms/amenities/list request
 *
 * Fetches all active amenities from the database.
 * Used by frontend to populate amenities checkboxes when creating rooms.
 *
 * QUERY PARAMS: None
 *
 * RESPONSE:
 * {
 *   "success": true,
 *   "message": "Amenities retrieved successfully",
 *   "data": [
 *     { "id": 1, "name": "WiFi", "icon": "wifi", "context": "Room" },
 *     { "id": 2, "name": "TV", "icon": "tv", "context": "Room" },
 *     ...
 *   ]
 * }
 *
 * @async
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {void}
 */
export async function getAmenitiesListController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { prisma } = await import("@/config/prisma");

    // Fetch all active amenities
    const amenities = await prisma.amenities.findMany({
      where: { is_active: true },
      select: {
        id: true,
        name: true,
        icon: true,
        context: true,
      },
      orderBy: { name: "asc" },
    });

    res.status(200).json({
      success: true,
      message: "Amenities retrieved successfully",
      data: amenities,
    });
  } catch (error: any) {
    console.error("Error fetching amenities:", error);

    // Database or server error
    res.status(500).json({
      success: false,
      message: "Failed to fetch amenities",
      error: { code: "SERVER_ERROR" },
    });
  }
}

/**
 * Handles GET /api/hotels/:hotelId/physical-rooms request
 *
 * Gets all physical rooms for a hotel across all room types
 *
 * URL PARAMS:
 * hotelId - Hotel ID
 *
 * QUERY PARAMS:
 * skip - Records to skip (default: 0)
 * take - Records to return (default: 100, max: 500)
 *
 * @async
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {void}
 */
export async function getHotelPhysicalRoomsController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Check authentication
    if (!req.actor) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
        error: { code: "UNAUTHORIZED" },
      });
      return;
    }

    const hotelId = parseInt((req.params.hotelId as string) || "0", 10);
    const skip = Math.max(0, parseInt((req.query.skip as string) || "0", 10));
    const take = Math.min(500, Math.max(1, parseInt((req.query.take as string) || "100", 10)));

    // Validate hotel ID
    if (!hotelId || hotelId <= 0) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        error: { code: "VALIDATION_ERROR", details: ["hotelId is required and must be > 0"] },
      });
      return;
    }

    // Authorization check
    if (req.actor.role === "SYSTEM_ADMIN") {
      // System admins can view physical rooms for any hotel
    } else if (req.actor.role === "HOTEL_ADMIN") {
      // Hotel admins can only view physical rooms for their assigned hotel
      try {
        const assignedHotel = await getHotelAdminAssignedHotel(req.actor.id);
        if (assignedHotel.hotel_id !== hotelId) {
          res.status(403).json({
            success: false,
            message: "You can only view physical rooms for your assigned hotel",
            error: { code: "FORBIDDEN" },
          });
          return;
        }
      } catch (authError: any) {
        if (authError.message === "ADMIN_NOT_FOUND" || authError.message === "HOTEL_NOT_FOUND") {
          res.status(403).json({
            success: false,
            message: "Hotel admin not found or not assigned to a hotel",
            error: { code: "FORBIDDEN" },
          });
          return;
        }
        throw authError; // Re-throw unexpected errors
      }
    } else {
      // Other roles cannot view physical rooms
      res.status(403).json({
        success: false,
        message: "Insufficient permissions",
        error: { code: "FORBIDDEN" },
      });
      return;
    }

    // Call service
    const result = await getHotelPhysicalRooms(hotelId, skip, take);

    // Return success
    res.status(200).json({
      success: true,
      message: "Physical rooms retrieved successfully",
      data: result,
    });
  } catch (error: any) {
    // Handle service errors
    if (error.message === "HOTEL_NOT_FOUND") {
      res.status(404).json({
        success: false,
        message: "Hotel not found",
        error: { code: "HOTEL_NOT_FOUND" },
      });
      return;
    }

    // Unexpected error
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: { code: "SERVER_ERROR" },
    });
  }
}
