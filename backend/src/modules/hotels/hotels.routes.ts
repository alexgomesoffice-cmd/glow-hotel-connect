/**
 * FILE: src/modules/hotels/hotels.routes.ts
 * PURPOSE: HTTP route definitions for hotel operations
 *
 * ROUTES:
 * POST /create - Create new hotel
 * GET / - List hotels with filters and pagination
 * GET /:id - Get single hotel details
 * PUT /:id - Update hotel information
 * PUT /:id/approval - Update approval status
 * DELETE /:id - Delete hotel (soft delete)
 *
 * USAGE:
 * import hotelsRouter from '@/modules/hotels/hotels.routes';
 * router.use('/hotels', hotelsRouter);
 */

import { Router } from "express";
import { authenticate } from "@/middlewares/auth.middleware";
import {
  createHotelController,
  getHotelController,
  listAmenitiesController,
  listHotelsController,
  updateHotelController,
  updateApprovalStatusController,
  deleteHotelController,
} from "./hotels.controller";
import {
  createHotelAdminController,
  getHotelAdminController,
  updateHotelAdminDetailsController,
  getMyAssignedHotelController,
} from "./hotelAdmin.controller";
import { getHotelAdmin } from "./hotelAdmin.service";
import { getHotelPhysicalRoomsController } from "../rooms/rooms.controller";

const router = Router();

/**
 * POST /create
 * Create a new hotel (optionally with details, amenities, images, and admin)
 * @requires Authentication
 * @body {
 *   name,
 *   email?,
 *   city?,
 *   address?,
 *   hotel_type?,
 *   owner_name?,
 *   zip_code?,
 *   details?: { description?, reception_no1?, reception_no2?, star_rating?, guest_rating? },
 *   amenities?: string[],
 *   images?: string[],
 *   admin?: { name, email, password, phone?, nid_no?, manager_name?, manager_phone? }
 * }
 * @returns {hotel_id, name, email, city, approval_status, created_at, hotel_details?, hotel_amenities?, hotel_images?, hotel_admins?}
 */
router.post("/create", authenticate, createHotelController);

/**
 * GET /
 * List all hotels with filtering and pagination
 * @query {skip?, take?, approval_status?, city?, hotel_type?}
 * @returns {hotels: [], total, skip, take}
 */
router.get("/", listHotelsController);

/**
 * GET /:id
 * Get hotel details by ID
 * @param {id} Hotel ID
 * @returns {hotel_id, name, email, address, city, hotel_type, owner_name, description, star_rating, guest_rating, approval_status, published_at, created_at, updated_at}
 */
/**
 * GET /amenities
 * List all active amenity options (for checkboxes)
 * @returns {amenities: [{id, name}]}
 */
router.get("/amenities", listAmenitiesController);

router.get("/:id", getHotelController);

/**
 * POST /upload-images
 * Upload hotel images (accepts base64 or file uploads)
 * @requires Authentication
 * @body {images: string[] (base64), hotel_id: number}
 * @returns {urls: string[]}
 */
router.post("/upload-images", authenticate, async (req, res) => {
  try {
    // For now, just return the images as-is if they're base64
    // In production, you would upload to Cloudinary, AWS S3, etc.
    const { images } = req.body;
    
    if (!Array.isArray(images)) {
      res.status(400).json({
        success: false,
        message: "Images must be an array",
        error: { code: "INVALID_INPUT" },
      });
      return;
    }

    // Return the images (in production, upload and return URLs)
    res.json({
      success: true,
      data: {
        urls: images.filter((img: any) => typeof img === 'string'),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to process images",
      error: { code: "UPLOAD_ERROR" },
    });
  }
});

/**
 * PUT /:id
 * Update hotel information
 * @requires Authentication
 * @param {id} Hotel ID
 * @body {name?, email?, city?, address?, hotel_type?, owner_name?, description?, star_rating?}
 * @returns {hotel_id, name, email, city, approval_status, updated_at}
 */
router.put("/:id", authenticate, updateHotelController);

/**
 * PUT /:id/approval
 * Update hotel approval status
 * @requires Authentication
 * @param {id} Hotel ID
 * @body {approval_status: DRAFT|PENDING_APPROVAL|PUBLISHED|REJECTED}
 * @returns {hotel_id, approval_status, published_at, updated_at}
 */
router.put("/:id/approval", authenticate, updateApprovalStatusController);

/**
 * DELETE /:id
 * Delete hotel (soft delete)
 * @requires Authentication
 * @param {id} Hotel ID
 * @returns {message, hotel_id}
 */
router.delete("/:id", authenticate, deleteHotelController);

/**
 * Hotel Admin Routes
 * ─────────────────────────────────────────────
 */

/**
 * POST /admin/create
 * Create a new hotel admin account
 * @requires Authentication (system admin)
 * @body {hotel_id, name, email, password, phone?, nid_no?, manager_name?, manager_phone?}
 * @returns {hotel_admin_id, name, email, hotel_id, hotel_admin_details}
 */
router.post("/admin/create", authenticate, createHotelAdminController);

/**
 * GET /admin/me
 * Get current authenticated hotel admin details
 * @requires Authentication
 * @returns {name, email, phone, nid_no, role}
 */
router.get("/admin/me", authenticate, async (req, res) => {
  try {
    if (!req.actor) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
        error: { code: "UNAUTHORIZED" },
      });
      return;
    }

    console.log("[DEBUG] /admin/me - req.actor:", req.actor);

    // Get admin details from database
    const admin = await getHotelAdmin(req.actor.id);
    
    if (!admin) {
      res.status(404).json({
        success: false,
        message: "Hotel admin not found",
        error: { code: "ADMIN_NOT_FOUND" },
      });
      return;
    }

    res.json({
      success: true,
      data: {
        name: admin.name,
        email: admin.email,
        phone: admin.hotel_admin_details?.phone,
        nid_no: admin.hotel_admin_details?.nid_no,
        role: req.actor.role || "HOTEL_ADMIN",
      },
    });
  } catch (error: any) {
    console.error("[ERROR] /admin/me error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch admin details",
      error: { code: "SERVER_ERROR" },
    });
  }
});

/**
 * GET /admin/me/assigned-hotel
 * Get the hotel assigned to the authenticated hotel admin
 * Used by hotel admins to fetch their assigned hotel (no URL params needed)
 * @requires Authentication
 * @returns {hotel_id, name, email, city, address, hotel_type, owner_name, description, star_rating}
 */
router.get("/admin/me/assigned-hotel", authenticate, getMyAssignedHotelController);

/**
 * GET /admin/:id
 * Get hotel admin details by ID
 * @param {id} Hotel admin ID
 * @returns {hotel_admin_id, name, email, hotel_id, hotel_admin_details}
 */
router.get("/admin/:id", getHotelAdminController);

/**
 * PUT /admin/:id
 * Update hotel admin details
 * @requires Authentication
 * @param {id} Hotel admin ID
 * @body {phone?, nid_no?, manager_name?, manager_phone?, address?, image_url?}
 * @returns {updated details}
 */
router.put("/admin/:id", authenticate, updateHotelAdminDetailsController);

/**
 * GET /:hotelId/physical-rooms
 * Get all physical rooms for a hotel across all room types
 * @param {hotelId} Hotel ID
 * @query {skip?, take?}
 * @returns {hotel_id, total, rooms: [...], skip, take}
 */
router.get("/:hotelId/physical-rooms", authenticate, getHotelPhysicalRoomsController);

export default router;
