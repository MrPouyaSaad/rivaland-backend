import * as productService from "./adminProductService.js";

// 📌 لیست محصولات با فیلتر و جستجو
export const listProducts = async (req, res) => {
  try {
    const products = await productService.getAllProducts(req.query);
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: "خطا در دریافت محصولات", details: error.message });
  }
};

// 📌 دریافت جزئیات محصول
export const getProduct = async (req, res) => {
  try {
    const product = await productService.getProductById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "محصول یافت نشد" });
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: "خطا در دریافت محصول", details: error.message });
  }
};

// 📌 ایجاد محصول جدید
export const createProduct = async (req, res) => {
  try {
    const files = (req.files || []).filter(f => f.originalname && f.buffer);

    let fields = [];
    try { fields = req.body.fields ? JSON.parse(req.body.fields) : []; } catch { fields = []; }

    let labels = [];
    try { labels = req.body.labels ? JSON.parse(req.body.labels) : []; } catch { labels = []; }

    const productData = {
      name: req.body.name,
      price: parseFloat(req.body.price),
      stock: parseInt(req.body.stock),
      categoryId: parseInt(req.body.categoryId),
      description: req.body.description,
      isActive: req.body.isActive === "true" || req.body.isActive === true,
      discount: req.body.discount ? parseFloat(req.body.discount) : 0,
      discountType: req.body.discountType || "amount",
      fields,
      labels, // اضافه شد
    };

    const product = await productService.createProduct(productData, files);

    res.status(201).json({ success: true, data: product, message: "محصول با موفقیت ایجاد شد" });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ success: false, message: "خطا در ایجاد محصول", details: error.message });
  }
};

// 📌 بروزرسانی محصول
export const updateProduct = async (req, res) => {
  try {
    const files = (req.files || []).filter(file => file?.originalname && file?.buffer);

    let fields = null;
    try { fields = req.body.fields ? JSON.parse(req.body.fields) : null; } catch { fields = null; }

    let labels = null;
    try { labels = req.body.labels ? JSON.parse(req.body.labels) : null; } catch { labels = null; }

    const productData = {
      name: req.body.name,
      price: req.body.price ? parseFloat(req.body.price) : undefined,
      stock: req.body.stock ? parseInt(req.body.stock) : undefined,
      categoryId: req.body.categoryId ? parseInt(req.body.categoryId) : undefined,
      description: req.body.description,
      isActive: req.body.isActive !== undefined
        ? (req.body.isActive === "true" || req.body.isActive === true)
        : undefined,
      discount: req.body.discount ? parseFloat(req.body.discount) : undefined,
      discountType: req.body.discountType,
      fields,
      labels, // اضافه شد
    };

    const product = await productService.updateProduct(req.params.id, productData, files);

    res.json({ success: true, data: product, message: "محصول با موفقیت بروزرسانی شد" });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ success: false, message: "خطا در بروزرسانی محصول", details: error.message });
  }
};

// 📌 حذف محصول
export const deleteProduct = async (req, res) => {
  try {
    await productService.deleteProduct(req.params.id);
    res.status(200).json({ success: true, message: "محصول با موفقیت حذف شد" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ success: false, message: "خطا در حذف محصول", details: error.message });
  }
};
