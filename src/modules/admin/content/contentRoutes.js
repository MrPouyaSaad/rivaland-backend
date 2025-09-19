import express from "express";
import multer from "multer";
import * as bannerController from "./contentController.js";
import { auth } from "../../../common/auth/authMiddleware.js";

const upload = multer();
const router = express.Router();

// فقط ادمین
router.use(auth("admin"));

// آپلود چند بنر همزمان با محدودیت تعداد
// slider: حداکثر 5 تصویر
// small: حداکثر 10 تصویر
const bannerUpload = upload.fields([
  { name: "slider", maxCount: 5 },
  { name: "small", maxCount: 10 },
]);

// 📌 دریافت همه بنرها
router.get("/", bannerController.getAllBannersHandler);

// 📌 ایجاد بنرها (لیست)
router.post("/", bannerUpload, bannerController.createMultipleBannersHandler);

// 📌 بروزرسانی یک بنر
router.put("/:id", upload.single("image"), bannerController.updateBannerHandler);

// 📌 حذف یک بنر
router.delete("/:id", bannerController.deleteBannerHandler);

// 📌 تغییر وضعیت فعال/غیرفعال
router.patch("/:id/toggle", bannerController.toggleBannerActiveHandler);

export default router;
