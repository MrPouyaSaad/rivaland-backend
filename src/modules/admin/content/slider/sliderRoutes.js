// src/modules/admin/content/slider/sliderRoutes.js
import express from "express";
import multer from "multer";
import { auth } from "../../../../common/auth/authMiddleware.js";
import * as sliderController from "./sliderController.js";

const upload = multer();
const router = express.Router();

router.use(auth("admin"));

router.get("/", sliderController.getSliders);
router.post("/", upload.array("images",5), sliderController.createSliders);
router.delete("/:id", sliderController.removeSlider);
router.patch("/:id/toggle", sliderController.toggleSlider);

export default router;
