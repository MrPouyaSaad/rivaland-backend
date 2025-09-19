import * as categoryService from "./categoryService.js";

// ----------------------------
// 📌 Get all categories handler
// ----------------------------
export async function getAllCategoriesHandler(req, res) {
  try {
    const categories = await categoryService.getAllCategories();
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
