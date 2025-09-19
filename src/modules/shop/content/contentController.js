import * as contentService from "./contentService.js";

// ----------------------------
// 📌 Get small banners (Header)
// ----------------------------
export async function getSmallBannersHandler(req, res) {
  try {
    const banners = await contentService.getSmallBanners();
    res.json({ success: true, data: banners });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

// ----------------------------
// 📌 Get slider banners (Main Body)
// ----------------------------
export async function getSliderBannersHandler(req, res) {
  try {
    const banners = await contentService.getSliderBanners();
    res.json({ success: true, data: banners });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
