import * as smallBannerService from "./small_bannerService.js";

export async function listSmallBanners(req, res) {
  try {
    const banners = await smallBannerService.getAllSmallBanners();
    res.json({ success: true, data: banners });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function createSmallBanners(req, res) {
  try {
    const files = req.files;
    const banners = await smallBannerService.createSmallBanners(files);
    res.status(201).json({
      success: true,
      data: banners,
      message: "بنرها با موفقیت اضافه شدند",
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function removeSmallBanner(req, res) {
  try {
    await smallBannerService.deleteSmallBanner(req.params.id);
    res.json({ success: true, message: "بنر با موفقیت حذف شد" });
  } catch (error) {
    if (error.message.includes("یافت نشد")) {
      res.status(404).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

export async function changeSmallBannerStatus(req, res) {
  try {
    const { isActive } = req.body;
    const updated = await smallBannerService.toggleSmallBannerStatus(req.params.id, isActive);
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
