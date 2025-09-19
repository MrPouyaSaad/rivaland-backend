import express from "express";
import * as productController from "../products/adminProductController.js";
import { auth } from "../../../common/auth/authMiddleware.js";
import multer from "multer";

const router = express.Router();
router.use(auth("admin"));

const upload = multer();

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: مدیریت محصولات
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         price:
 *           type: number
 *         stock:
 *           type: integer
 *         description:
 *           type: string
 *         isActive:
 *           type: boolean
 *         discount:
 *           type: number
 *         discountType:
 *           type: string
 *           enum: [amount, percent]
 *         image:
 *           type: string
 *           description: تصویر اصلی محصول
 *         images:
 *           type: array
 *           items:
 *             type: string
 *         fields:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               fieldId:
 *                 type: integer
 *               title:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [string, number, boolean, select, multi-select]
 *               required:
 *                 type: boolean
 *               options:
 *                 type: array
 *                 items:
 *                   type: string
 *               value:
 *                 type: string
 *         createdAtShamsi:
 *           type: string
 *           example: "1403/07/22"
 */

// 📌 لیست محصولات
router.get("/", productController.listProducts);

// 📌 جزئیات محصول
router.get("/:id", productController.getProduct);

// 📌 ایجاد محصول جدید با فیلدها و لیست عکس‌ها
router.post("/", upload.array('images', 5), productController.createProduct);

// 📌 بروزرسانی محصول با فیلدها و لیست عکس‌ها
router.put("/:id",upload.array('images', 5), productController.updateProduct);

// 📌 حذف محصول
router.delete("/:id", productController.deleteProduct);

export default router;
