/**
 * FILE: src/modules/profiles/profiles.controller.ts
 * PURPOSE: HTTP request/response handlers for profile operations
 *
 * ROUTES:
 * GET /end-user - Get current end user profile (authenticated)
 * PATCH /end-user - Update current end user profile (authenticated)
 */

import type { Request, Response, NextFunction } from "express";
import { getEndUserProfile, updateEndUserProfile } from "./profiles.service";

/**
 * Handles GET /api/profiles/end-user request
 * Retrieves current authenticated end user's profile
 *
 * REQUIRES: Authentication (END_USER role)
 *
 * @async
 * @param {Request} req - Express request object (req.actor.id is end_user_id)
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {void}
 */
export async function getEndUserProfileController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Get end user ID from authenticated token
    const endUserId = (req as any).actor.id;

    if (!endUserId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized: No user ID in token",
        error: { code: "NO_USER_ID" },
      });
      return;
    }

    // Call service to get profile
    const profile = await getEndUserProfile(endUserId);

    // Return success
    res.status(200).json({
      success: true,
      message: "Profile retrieved successfully",
      data: profile,
    });
  } catch (error: any) {
    if (error.message === "END_USER_NOT_FOUND") {
      res.status(404).json({
        success: false,
        message: "End user not found",
        error: { code: "END_USER_NOT_FOUND" },
      });
      return;
    }

    console.error("getEndUserProfileController error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: { code: "SERVER_ERROR" },
    });
  }
}

/**
 * Handles PATCH /api/profiles/end-user request
 * Updates current authenticated end user's profile
 *
 * REQUIRES: Authentication (END_USER role)
 *
 * REQUEST BODY:
 * {
 *   "dob": "1990-01-01",         (optional, format: YYYY-MM-DD)
 *   "gender": "M" or "F",        (optional)
 *   "address": "123 Main St",    (optional)
 *   "country": "Bangladesh",     (optional)
 *   "nid_no": "1234567890",      (optional)
 *   "passport": "AB123456",      (optional)
 *   "phone": "+8801712345678",   (optional)
 *   "emergency_contact": "Mom",  (optional)
 *   "image_url": "https://..."   (optional)
 * }
 *
 * @async
 * @param {Request} req - Express request object (req.actor.id is end_user_id, req.body is updates)
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {void}
 */
export async function updateEndUserProfileController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Get end user ID from authenticated token
    const endUserId = (req as any).actor.id;
    const updates = req.body;

    if (!endUserId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized: No user ID in token",
        error: { code: "NO_USER_ID" },
      });
      return;
    }

    if (!updates || Object.keys(updates).length === 0) {
      res.status(400).json({
        success: false,
        message: "No fields to update",
        error: { code: "NO_FIELDS_TO_UPDATE" },
      });
      return;
    }

    // Call service to update profile
    const profile = await updateEndUserProfile(endUserId, updates);

    // Return success
    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: profile,
    });
  } catch (error: any) {
    if (error.message === "END_USER_NOT_FOUND") {
      res.status(404).json({
        success: false,
        message: "End user not found",
        error: { code: "END_USER_NOT_FOUND" },
      });
      return;
    }

    console.error("updateEndUserProfileController error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: { code: "SERVER_ERROR" },
    });
  }
}
