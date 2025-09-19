import express from "express";
import * as userController from "./adminUserController.js";
import { auth } from "../../../common/auth/authMiddleware.js";

const router = express.Router();
router.use(auth("admin"));

/**
 * @swagger
 * tags:
 *   name: Admin Users
 *   description: مدیریت کاربران
 */

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: لیست کاربران با فیلتر و جستجو
 *     tags: [Admin Users]
 *     parameters:
 *       - in: query
 *         name: filter
 *         schema:
 *           type: string
 *           enum: [all, active, inactive, buyers, no_buy, pending]
 *         description: نوع فیلتر
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: جستجو بر اساس نام یا ایمیل
 *     responses:
 *       200:
 *         description: لیست کاربران
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 - id: 1
 *                   name: "Pouya"
 *                   email: "pouya@example.com"
 *                   city: "Tehran"
 *                   createdAt: "2025-08-10T10:00:00.000Z"
 *                   lastLogin: "2025-09-14T12:30:00.000Z"
 *                   orderCount: 5
 *                   totalPurchase: 1500000
 *                   status: "active"
 */
router.get("/", userController.listUsers);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   get:
 *     summary: مشاهده جزئیات یک کاربر
 *     tags: [Admin Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: جزئیات کاربر
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 id: 1
 *                 name: "Pouya"
 *                 email: "pouya@example.com"
 *                 city: "Tehran"
 *                 createdAt: "2025-08-10T10:00:00.000Z"
 *                 lastLogin: "2025-09-14T12:30:00.000Z"
 *                 orderCount: 5
 *                 totalPurchase: 1500000
 *                 status: "active"
 *       404:
 *         description: کاربر یافت نشد
 */
router.get("/:id", userController.getUser);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     summary: حذف کاربر
 *     tags: [Admin Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: کاربر حذف شد
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "کاربر حذف شد"
 *       404:
 *         description: کاربر یافت نشد
 */
router.delete("/:id", userController.removeUser);

export default router;
