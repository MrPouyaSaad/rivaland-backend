import express from "express";
import multer from "multer";
import * as bannerController from "./small_bannerController.js";
import { auth } from "../../../../common/auth/authMiddleware.js";

const router = express.Router();
const upload = multer();

router.use(auth("admin"));

router.get("/", bannerController.listSmallBanners);
router.post("/", upload.array("images",5), bannerController.createSmallBanners);
router.delete("/:id", bannerController.removeSmallBanner);
router.patch("/:id/status", bannerController.changeSmallBannerStatus);

export default router;
