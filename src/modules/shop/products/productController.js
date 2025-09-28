import * as productService from "./productService.js";

export async function getAllProducts(req, res) {
  try {
    const { page, limit } = req.query;
    const result = await productService.getAllProducts({ page, limit });
    res.json({ success: true, data: result.products, pagination: result.pagination });
  } catch (error) {
    console.error("[ProductController] Error in getAllProducts:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getProductsByCategory(req, res) {
  try {
    const { categoryId, page, limit } = req.query;
    if (!categoryId) return res.status(400).json({ success: false, message: "آیدی دسته‌بندی الزامی است" });

    const result = await productService.getProductsByCategory(categoryId, { page, limit });
    res.json({ success: true, data: result.products, pagination: result.pagination });
  } catch (error) {
    console.error("[ProductController] Error in getProductsByCategory:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getProductsByLabel(req, res) {
  try {
    const { label, page, limit } = req.query;
    if (!label) return res.status(400).json({ success: false, message: "نام لیبل الزامی است" });

    const result = await productService.getProductsByLabel(label, { page, limit });
    res.json({ success: true, data: result.products, pagination: result.pagination });
  } catch (error) {
    console.error("[ProductController] Error in getProductsByLabel:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getProductById(req, res) {
  try {
    const { id } = req.params;
    const product = await productService.getProductById(id);
    res.json({ success: true, data: product });
  } catch (error) {
    console.error("[ProductController] Error in getProductById:", error);
    res.status(404).json({ success: false, message: error.message });
  }
}

export async function searchProducts(req, res) {
  try {
    const { q: search, page, limit } = req.query;
    if (!search) return res.status(400).json({ success: false, message: "عبارت جستجو الزامی است" });

    const result = await productService.searchProductsByName(search, { page, limit });
    res.json({ success: true, data: result.products, pagination: result.pagination });
  } catch (error) {
    console.error("[ProductController] Error in searchProducts:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}
