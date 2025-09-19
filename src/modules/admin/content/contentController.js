import express from "express";
import multer from "multer";
import {
  getAllBanners,
  getBannerById,
  createMultipleBanners,
  updateBanner,
  deleteBanner,
  toggleBannerActive,
} from "./bannerService.js"; // مسیر سرویس بنرها

const router = express.Router();
const upload = multer(); // multer برای دریافت فایل‌ها از فرم

// ----------------------------
// 📌 دریافت همه بنرها (slider یا small)
// ----------------------------
router.get("/", async (req, res) => {
  try {
    const { type } = req.query; // slider یا small
    const banners = await getAllBanners(type);
    res.json({ success: true, data: banners });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ----------------------------
// 📌 دریافت یک بنر بر اساس شناسه
// ----------------------------
router.get("/:id", async (req, res) => {
  try {
    const banner = await getBannerById(req.params.id);
    if (!banner) return res.status(404).json({ success: false, error: "بنر یافت نشد" });
    res.json({ success: true, data: banner });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ----------------------------
// 📌 ایجاد چند بنر همزمان (slider و small)
// ----------------------------
const bannerUpload = upload.fields([
  { name: "slider", maxCount: 5 }, // حداکثر 5 بنر بزرگ
  { name: "small", maxCount: 10 }, // حداکثر 10 بنر کوچک
]);

router.post("/", bannerUpload, async (req, res) => {
  try {
    // req.files = { slider: [File], small: [File] }
    const banners = await createMultipleBanners(req.files);
    res.status(201).json({ success: true, data: banners, message: "بنرها با موفقیت ایجاد شدند" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ----------------------------
// 📌 بروزرسانی یک بنر
// ----------------------------
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const data = {
      title: req.body.title,
      type: req.body.type,
      link: req.body.link || null,
      isActive: req.body.isActive === "true",
    };
    const banner = await updateBanner(req.params.id, data, req.file);
    res.json({ success: true, data: banner, message: "بنر با موفقیت بروزرسانی شد" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ----------------------------
// 📌 حذف یک بنر
// ----------------------------
router.delete("/:id", async (req, res) => {
  try {
    await deleteBanner(req.params.id);
    res.json({ success: true, message: "بنر با موفقیت حذف شد" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ----------------------------
// 📌 تغییر وضعیت فعال/غیرفعال یک بنر
// ----------------------------
router.patch("/:id/toggle", async (req, res) => {
  try {
    const { isActive } = req.body;
    const banner = await toggleBannerActive(
      req.params.id,
      isActive === true || isActive === "true"
    );
    res.json({ success: true, data: banner, message: "وضعیت بنر با موفقیت تغییر یافت" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
