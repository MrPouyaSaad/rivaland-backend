// src/modules/admin/content/slider/sliderController.js
import * as sliderService from "./sliderService.js";

export async function getSliders(req, res) {
  try {
    const sliders = await sliderService.getAllSliders();
    res.status(200).json({ success: true, data: sliders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function createSliders(req, res) {
  try {
    const created = await sliderService.createSliders(req.files);
    res.status(201).json({
      success: true,
      message: "اسلایدرها با موفقیت ایجاد شدند",
      data: created,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

export async function removeSlider(req, res) {
  try {
    const deleted = await sliderService.deleteSlider(req.params.id);
    res.status(200).json({ success: true, data: deleted, message: "اسلایدر حذف شد" });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
}

export async function toggleSlider(req, res) {
  try {
    const updated = await sliderService.toggleSliderStatus(
      req.params.id,
      req.body.isActive
    );
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}
