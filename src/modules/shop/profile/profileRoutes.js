import express from "express";
import * as profileController from "./profileController.js";
import { auth } from "../../../common/auth/authMiddleware.js";

const router = express.Router();

// همه مسیرها فقط برای کاربران با نقش "user" مجاز است
router.use(auth("user"));

/**
 * @swagger
 * tags:
 *   name: Profile
 *   description: مدیریت پروفایل و سفارشات کاربر
 */

// GET پروفایل
router.get("/profile", profileController.getProfileHandler);

// PUT بروزرسانی پروفایل
router.put("/profile", profileController.updateProfileHandler);

// GET سفارشات
router.get("/orders", profileController.getOrdersHandler);

// POST لغو سفارش
router.post("/orders/:orderId/cancel", profileController.cancelOrderHandler);

// GET آمار سفارشات
router.get("/orders/stats", profileController.getOrderStatsHandler);

export default router;
