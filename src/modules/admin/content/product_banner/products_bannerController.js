import * as productsBannerService from "./products_bannerService.js";

export async function listProductsBanners(req, res) {
  try {
    const banners = await productsBannerService.getAllProductsBanners();
    res.json({ success: true, data: banners });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function createProductsBanners(req, res) {
  try {
    const files = req.files;
    const banners = await productsBannerService.createProductsBanners(files);
    res.status(201).json({
      success: true,
      data: banners,
      message: "بنرها با موفقیت اضافه شدند",
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function removeProductsBanner(req, res) {
  try {
    await productsBannerService.deleteProductsBanner(req.params.id);
    res.json({ success: true, message: "بنر با موفقیت حذف شد" });
  } catch (error) {
    if (error.message.includes("یافت نشد")) {
      res.status(404).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

export async function changeProductsBannerStatus(req, res) {
  try {
    const { isActive } = req.body;
    const updated = await productsBannerService.toggleProductsBannerStatus(req.params.id, isActive);
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
