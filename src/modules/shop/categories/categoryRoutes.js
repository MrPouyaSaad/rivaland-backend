import express from "express";
import * as categoryController from "./categoryController.js";

const router = express.Router();

// 📌 لیست دسته‌بندی‌ها
router.get("/", categoryController.getAllCategoriesHandler);

export default router;
