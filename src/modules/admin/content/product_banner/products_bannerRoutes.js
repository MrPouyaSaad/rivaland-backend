import express from "express";
import multer from "multer";
import * as bannerController from "./products_bannerController.js";
import { auth } from "../../../../common/auth/authMiddleware.js";

const router = express.Router();
const upload = multer();

router.use(auth("admin"));

router.get("/", bannerController.listProductsBanners);
router.post("/", upload.array("images"), bannerController.createProductsBanners);
router.delete("/:id", bannerController.removeProductsBanner);
router.patch("/:id/status", bannerController.changeProductsBannerStatus);

export default router;
