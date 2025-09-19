import express from "express";
import * as dashboardSummaryController from "./DashboardSummaryController.js";
import { auth } from "../../../../common/auth/authMiddleware.js";

const router = express.Router();
router.use(auth("admin")); // فقط ادمین

/**
 * @swagger
 * tags:
 *   name: Dashboard - Summary
 *   description: آمار کلی داشبورد مدیریت
 */

/**
 * @swagger
 * /admin/dashboard/summary:
 *   get:
 *     summary: دریافت آمار کلی سیستم (فروش، سفارشات، کاربران)
 *     tags: [Dashboard - Summary]
 *     responses:
 *       200:
 *         description: موفقیت‌آمیز - آمار کلی سیستم
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     revenue:
 *                       type: number
 *                       example: 125400000
 *                     orders:
 *                       type: integer
 *                       example: 1248
 *                     users:
 *                       type: integer
 *                       example: 5623
 */
router.get("/", dashboardSummaryController.getSummary);

export default router;
