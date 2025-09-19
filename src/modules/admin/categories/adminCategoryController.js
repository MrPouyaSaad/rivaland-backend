import * as categoryService from "./adminCategoryService.js";

// 📌 دریافت همه دسته‌بندی‌ها با فیلدها
export const getCategories = async (req, res) => {
  try {
    const categories = await categoryService.getAllCategories();
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getCategory = async (req, res) => {
  try {
    const category = await categoryService.getCategoryById(req.params.id);
    res.json({ success: true, data: category });
  } catch (error) {
    if (error.message.includes("یافت نشد") || error.message.includes("معتبر نیست")) {
      res.status(404).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: error.message });
    }
  }
};


// 📌 ایجاد دسته‌بندی جدید با فیلدهای داینامیک
export const createNewCategory = async (req, res) => {
  try {
    const { name, fields } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, error: "نام دسته‌بندی الزامی است" });
    }

    // پردازش فیلدها اگر ارسال شده باشند
    let parsedFields = [];
    if (fields) {
      try {
        parsedFields = typeof fields === 'string' ? JSON.parse(fields) : fields;
        if (!Array.isArray(parsedFields)) {
          return res.status(400).json({ success: false, error: "فیلدها باید آرایه باشند" });
        }

        for (const field of parsedFields) {
          if (!field.name || !field.type) {
            return res.status(400).json({ success: false, error: "هر فیلد باید نام و نوع داشته باشد" });
          }

          const validTypes = ['string', 'number', 'boolean', 'select', 'multi-select'];
          if (!validTypes.includes(field.type)) {
            return res.status(400).json({ success: false, error: `نوع فیلد ${field.name} معتبر نیست` });
          }
        }
      } catch {
        return res.status(400).json({ success: false, error: "فرمت فیلدها نامعتبر است" });
      }
    }

    const categoryData = { name, fields: parsedFields };
    const category = await categoryService.addCategory(categoryData, req.file);

    res.status(201).json({ 
      success: true, 
      data: category, 
      message: "دسته‌بندی با موفقیت ایجاد شد" 
    });
  } catch (error) {
    if (error.message.includes("قبلاً وجود دارد")) {
      res.status(409).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: error.message });
    }
  }
};


// 📌 بروزرسانی دسته‌بندی
export const updateExistingCategory = async (req, res) => {
  try {
    const { name, fields } = req.body;

    let parsedFields = [];
    if (fields) {
      try {
        parsedFields = typeof fields === 'string' ? JSON.parse(fields) : fields;
        if (!Array.isArray(parsedFields)) {
          return res.status(400).json({ success: false, error: "فیلدها باید آرایه باشند" });
        }

        for (const field of parsedFields) {
          if (!field.name || !field.type) {
            return res.status(400).json({ success: false, error: "هر فیلد باید نام و نوع داشته باشد" });
          }

          const validTypes = ['string', 'number', 'boolean', 'select', 'multi-select'];
          if (!validTypes.includes(field.type)) {
            return res.status(400).json({ success: false, error: `نوع فیلد ${field.name} معتبر نیست` });
          }
        }
      } catch {
        return res.status(400).json({ success: false, error: "فرمت فیلدها نامعتبر است" });
      }
    }

    const categoryData = { name, fields: parsedFields };
    const category = await categoryService.modifyCategory(req.params.id, categoryData, req.file);

    res.json({ success: true, data: category, message: "دسته‌بندی با موفقیت بروزرسانی شد" });
  } catch (error) {
    if (error.message.includes("یافت نشد") || error.message.includes("معتبر نیست")) {
      res.status(404).json({ success: false, error: error.message });
    } else if (error.message.includes("قبلاً وجود دارد")) {
      res.status(409).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: error.message });
    }
  }
};

// 📌 حذف دسته‌بندی
export const deleteExistingCategory = async (req, res) => {
  try {
    const result = await categoryService.removeCategory(req.params.id);
    res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    if (error.message.includes("یافت نشد") || error.message.includes("معتبر نیست")) {
      res.status(404).json({ success: false, error: error.message });
    } else if (error.message.includes("دارای محصول")) {
      res.status(400).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: error.message });
    }
  }
};

// 📌 دریافت دسته‌بندی‌ها بدون محصولات
export const listCategoriesWithoutProducts = async (req, res) => {
  try {
    const categories = await categoryService.getAllCategoriesWithoutProducts();
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 📌 دریافت دسته‌بندی بدون محصولات
export const getCategoryWithoutProducts = async (req, res) => {
  try {
    const category = await categoryService.getCategoryByIdWithoutProducts(req.params.id);
    res.json({ success: true, data: category });
  } catch (error) {
    if (error.message.includes("یافت نشد") || error.message.includes("معتبر نیست")) {
      res.status(404).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: error.message });
    }
  }
};

// 📌 دریافت فیلدهای یک دسته‌بندی (بدون options)
export const getCategoryFields = async (req, res) => {
  try {
    const fields = await categoryService.getCategoryFields(req.params.id);
    // حذف options قبل از ارسال
    const sanitizedFields = fields.map(f => ({
      id: f.id,
      name: f.name,
      type: f.type,
      required: f.required,
      createdAt: f.createdAt,
      updatedAt: f.updatedAt
    }));

    res.json({ success: true, data: sanitizedFields });
  } catch (error) {
    if (error.message.includes("یافت نشد") || error.message.includes("معتبر نیست")) {
      res.status(404).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: error.message });
    }
  }
};

// 📌 افزودن فیلد به دسته‌بندی (بدون options)
export const addFieldToCategory = async (req, res) => {
  try {
    const { name, type, required } = req.body;

    if (!name || !type) {
      return res.status(400).json({ success: false, error: "نام و نوع فیلد الزامی هستند" });
    }

    const validTypes = ['string', 'number', 'boolean', 'select', 'multi-select'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ success: false, error: `نوع فیلد معتبر نیست` });
    }

    const fieldData = { name: name.trim(), type, required: required !== undefined ? Boolean(required) : true };
    const field = await categoryService.addFieldToCategory(req.params.id, fieldData);

    // حذف options قبل از ارسال
    const sanitizedField = {
      id: field.id,
      name: field.name,
      type: field.type,
      required: field.required,
      createdAt: field.createdAt,
      updatedAt: field.updatedAt
    };

    res.status(201).json({ success: true, data: sanitizedField, message: "فیلد با موفقیت افزوده شد" });
  } catch (error) {
    if (error.message.includes("یافت نشد") || error.message.includes("معتبر نیست")) {
      res.status(404).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: error.message });
    }
  }
};

// 📌 حذف فیلد از دسته‌بندی
export const removeFieldFromCategory = async (req, res) => {
  try {
    const result = await categoryService.removeFieldFromCategory(req.params.fieldId);
    res.status(200).json({ success: true, message: result.message || "فیلد با موفقیت حذف شد" });
  } catch (error) {
    if (error.message.includes("یافت نشد") || error.message.includes("معتبر نیست")) {
      res.status(404).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: error.message });
    }
  }
};
