import express from "express";
import { getAllLabels } from "./labelsController.js";
import { auth } from "../../../common/auth/authMiddleware.js";

const router = express.Router();
router.use(auth("admin"));

// 📌 فقط دریافت لیست لیبل‌ها
router.get("/", getAllLabels);

export default router;
