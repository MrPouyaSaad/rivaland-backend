import express from "express";
import * as contentController from "./contentController.js";

const router = express.Router();

// 📌 بنرهای کوچک برای هدر
router.get("/small", contentController.getSmallBannersHandler);

// 📌 بنرهای بزرگ برای بادی
router.get("/slider", contentController.getSliderBannersHandler);

export default router;
