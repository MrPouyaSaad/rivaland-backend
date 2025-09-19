import express from "express";
import * as orderController from "./adminOrderController.js";
import { auth } from "../../../common/auth/authMiddleware.js";

const router = express.Router();
router.use(auth("admin"));

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: مدیریت سفارش‌ها توسط ادمین
 */

/**
 * @swagger
 * /api/admin/orders:
 *   get:
 *     summary: دریافت همه سفارش‌ها (با صفحه‌بندی، فیلتر، جستجو)
 *     tags: [Orders]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: شماره صفحه
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: تعداد آیتم در هر صفحه
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: فیلتر بر اساس وضعیت سفارش
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: جستجو در سفارش‌ها
 *     responses:
 *       200:
 *         description: لیست سفارش‌ها
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               total: 25
 *               page: 1
 *               pageSize: 10
 *               data:
 *                 - id: 1
 *                   user:
 *                     id: 12
 *                     username: "Pouya"
 *                     email: "pouya@example.com"
 *                   createdAt: "2025-09-14T10:23:00Z"
 *                   total: 150000
 *                   status: "pending"
 *                   items:
 *                     - productId: 2
 *                       name: "هولدر موبایل"
 *                       quantity: 1
 *                       price: 150000
 *       500:
 *         description: خطای سرور
 */

/**
 * @swagger
 * /api/admin/orders/{id}:
 *   get:
 *     summary: دریافت جزئیات یک سفارش
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: شناسه سفارش
 *     responses:
 *       200:
 *         description: اطلاعات کامل سفارش
 *         content:
 *           application/json:
 *             example:
 *               id: 1
 *               user:
 *                 id: 12
 *                 username: "Pouya"
 *                 email: "pouya@example.com"
 *               createdAt: "2025-09-14T10:23:00Z"
 *               total: 150000
 *               status: "paid"
 *               payment:
 *                 method: "online"
 *                 status: "success"
 *                 paidAt: "2025-09-14T11:00:00Z"
 *               shipping:
 *                 method: "post"
 *                 cost: 30000
 *                 trackingCode: "TRK123456"
 *               items:
 *                 - productId: 2
 *                   name: "هولدر موبایل"
 *                   quantity: 1
 *                   price: 150000
 *       404:
 *         description: سفارش پیدا نشد
 *       500:
 *         description: خطای سرور
 */

/**
 * @swagger
 * /api/admin/orders/{id}/status:
 *   put:
 *     summary: تغییر وضعیت سفارش
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: شناسه سفارش
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 description: وضعیت جدید سفارش
 *               trackingCode:
 *                 type: string
 *                 description: کد رهگیری (اختیاری)
 *           example:
 *             status: "shipped"
 *             trackingCode: "TRK123456"
 *     responses:
 *       200:
 *         description: وضعیت سفارش بروزرسانی شد
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "وضعیت سفارش تغییر کرد"
 *               data:
 *                 id: 1
 *                 status: "shipped"
 *                 trackingCode: "TRK123456"
 *       400:
 *         description: داده‌های ورودی نامعتبر
 *       404:
 *         description: سفارش پیدا نشد
 *       500:
 *         description: خطای سرور
 */

/**
 * @swagger
 * /api/admin/orders/{id}/payment:
 *   put:
 *     summary: بروزرسانی وضعیت پرداخت
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: شناسه سفارش
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - method
 *               - status
 *             properties:
 *               method:
 *                 type: string
 *                 description: روش پرداخت
 *               status:
 *                 type: string
 *                 description: وضعیت پرداخت
 *           example:
 *             method: "online"
 *             status: "success"
 *     responses:
 *       200:
 *         description: وضعیت پرداخت بروزرسانی شد
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "وضعیت پرداخت بروزرسانی شد"
 *       400:
 *         description: داده‌های ورودی نامعتبر
 *       404:
 *         description: سفارش پیدا نشد
 *       500:
 *         description: خطای سرور
 */

/**
 * @swagger
 * /api/admin/orders/{id}/invoice:
 *   get:
 *     summary: دریافت فاکتور سفارش (PDF)
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: شناسه سفارش
 *     responses:
 *       200:
 *         description: فایل PDF فاکتور
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: سفارش پیدا نشد
 *       500:
 *         description: خطای سرور
 */

/**
 * @swagger
 * /api/admin/orders/{id}:
 *   delete:
 *     summary: حذف سفارش
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: شناسه سفارش
 *     responses:
 *       204:
 *         description: سفارش حذف شد
 *       404:
 *         description: سفارش پیدا نشد
 *       500:
 *         description: خطای سرور
 */

// تعریف مسیرها
router.get("/", orderController.listOrders);
router.get("/:id", orderController.getOrder);
router.put("/:id/status", orderController.changeStatus);
router.put("/:id/payment", orderController.updatePayment);
router.get("/:id/invoice", orderController.printInvoice);
router.delete("/:id", orderController.deleteOrder);

export default router;