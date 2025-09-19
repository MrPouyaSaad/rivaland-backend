import express from "express";
import * as overviewController from "./OverviewTabContoller.js";
import { auth } from "../../../../common/auth/authMiddleware.js";

const router = express.Router();

// فقط ادمین دسترسی دارد
router.use(auth("admin"));

/**
 * @swagger
 * tags:
 *   name: Dashboard - Overview
 *   description: نمای کلی داشبورد مدیریت
 */

/**
 * @swagger
 * /api/admin/dashboard/overview:
 *   get:
 *     summary: دریافت آمار نمای کلی داشبورد
 *     tags: [Dashboard - Overview]
 *     responses:
 *       200:
 *         description: موفقیت‌آمیز - آمار داشبورد
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     revenue:
 *                       type: object
 *                       properties:
 *                         value:
 *                           type: number
 *                         growth:
 *                           type: number
 *                     orders:
 *                       type: object
 *                       properties:
 *                         value:
 *                           type: integer
 *                         growth:
 *                           type: number
 *                     customers:
 *                       type: object
 *                       properties:
 *                         value:
 *                           type: integer
 *                         growth:
 *                           type: number
 *                     avgBasket:
 *                       type: object
 *                       properties:
 *                         value:
 *                           type: number
 *                         growth:
 *                           type: number
 *                     weeklyChart:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           day:
 *                             type: integer
 *                           revenue:
 *                             type: number
 *                           orders:
 *                             type: integer
 *                     monthlyChart:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           month:
 *                             type: integer
 *                           revenue:
 *                             type: number
 *                           orders:
 *                             type: integer
 *                     topProducts:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                           price:
 *                             type: number
 *                           stock:
 *                             type: integer
 *                           sold:
 *                             type: integer
 *                     lowProducts:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                           price:
 *                             type: number
 *                           stock:
 *                             type: integer
 *                           sold:
 *                             type: integer
 */
router.get("/", overviewController.getOverview);

export default router;
