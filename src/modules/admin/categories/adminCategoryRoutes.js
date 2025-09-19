import express from "express";
import * as categoryController from "./adminCategoryController.js";
import { auth } from "../../../common/auth/authMiddleware.js";
import multer from "multer";
const upload = multer();

const router = express.Router();
router.use(auth("admin"));

/**
 * @swagger
 * tags:
 *   name: Admin Categories
 *   description: مدیریت دسته‌بندی‌ها توسط ادمین
 */

/**
 * @swagger
 * /api/admin/categories:
 *   get:
 *     summary: دریافت لیست تمام دسته‌بندی‌ها به همراه فیلدها
 *     tags: [Admin Categories]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: موفقیت آمیز
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CategoryWithFields'
 */
router.get("/", categoryController.getCategories);
router.get("/:id", categoryController.getCategory);
router.post("/", upload.single("image"), categoryController.createNewCategory);
router.put("/:id", upload.single("image"), categoryController.updateExistingCategory);
router.delete("/:id", categoryController.deleteExistingCategory);

// بدون محصولات
router.get("/without-products/list", categoryController.listCategoriesWithoutProducts);
router.get("/without-products/:id", categoryController.getCategoryWithoutProducts);

// فیلدها
router.get("/:id/fields", categoryController.getCategoryFields);
router.post("/:id/fields", categoryController.addFieldToCategory);
router.delete("/fields/:fieldId", categoryController.removeFieldFromCategory);

export default router;