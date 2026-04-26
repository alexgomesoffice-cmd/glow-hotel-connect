/**
 * FILE: src/modules/profiles/profiles.routes.ts
 * PURPOSE: HTTP routes for user profile operations (all user types)
 *
 * ROUTES:
 * GET /end-user - Get current end user profile (authenticated)
 * PATCH /end-user - Update current end user profile (authenticated)
 *
 * USAGE:
 * In src/routes.ts, add:
 * import profilesRouter from '@/modules/profiles/profiles.routes';
 * router.use('/profiles', profilesRouter);
 *
 * ENDPOINTS:
 * - GET /api/profiles/end-user (protected with END_USER auth)
 * - PATCH /api/profiles/end-user (protected with END_USER auth)
 */

import type { Request, Response, NextFunction } from "express";
import { Router } from "express";
import { authenticate } from "@/middlewares/auth.middleware";
import {
  getEndUserProfileController,
  updateEndUserProfileController,
} from "./profiles.controller";

const router = Router();

/**
 * GET /api/profiles/end-user
 * Get current end user's profile details
 *
 * REQUIRES: Authentication (END_USER role)
 *
 * HEADERS:
 * { "Authorization": "Bearer <token>" }
 *
 * RESPONSE:
 * {
 *   "success": true,
 *   "message": "Profile retrieved successfully",
 *   "data": {
 *     "end_user_detail_id": 1,
 *     "end_user_id": 42,
 *     "dob": "1990-01-01",
 *     "gender": "M",
 *     "address": "123 Main St",
 *     "country": "Bangladesh",
 *     "nid_no": "1234567890",
 *     "passport": "AB123456",
 *     "phone": "+8801712345678",
 *     "emergency_contact": "Mom",
 *     "image_url": "https://...",
 *     "updated_at": "2024-01-01T00:00:00Z"
 *   }
 * }
 *
 * ERROR RESPONSES:
 * - 401: Unauthorized (no token or invalid token)
 * - 403: Forbidden (token is not END_USER role)
 * - 404: Not found (end user doesn't exist)
 * - 500: Internal server error
 */
router.get(
  "/end-user",
  authenticate,
  getEndUserProfileController
);

/**
 * PATCH /api/profiles/end-user
 * Update current end user's profile details
 *
 * REQUIRES: Authentication (END_USER role)
 *
 * HEADERS:
 * { "Authorization": "Bearer <token>", "Content-Type": "application/json" }
 *
 * REQUEST BODY:
 * {
 *   "dob": "1990-01-01",         (optional)
 *   "gender": "M",               (optional)
 *   "address": "123 Main St",    (optional)
 *   "country": "Bangladesh",     (optional)
 *   "nid_no": "1234567890",      (optional)
 *   "passport": "AB123456",      (optional)
 *   "phone": "+8801712345678",   (optional)
 *   "emergency_contact": "Mom",  (optional)
 *   "image_url": "https://..."   (optional)
 * }
 *
 * RESPONSE:
 * {
 *   "success": true,
 *   "message": "Profile updated successfully",
 *   "data": {
 *     "end_user_detail_id": 1,
 *     "end_user_id": 42,
 *     "dob": "1990-01-01",
 *     "gender": "M",
 *     "address": "123 Main St",
 *     "country": "Bangladesh",
 *     "nid_no": "1234567890",
 *     "passport": "AB123456",
 *     "phone": "+8801712345678",
 *     "emergency_contact": "Mom",
 *     "image_url": "https://...",
 *     "updated_at": "2024-01-01T00:00:00Z"
 *   }
 * }
 *
 * ERROR RESPONSES:
 * - 400: Validation error
 * - 401: Unauthorized (no token or invalid token)
 * - 403: Forbidden (token is not END_USER role)
 * - 404: Not found (end user doesn't exist)
 * - 500: Internal server error
 */
router.patch(
  "/end-user",
  authenticate,
  updateEndUserProfileController
);

export default router;
