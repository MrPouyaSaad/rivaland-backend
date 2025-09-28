// src/modules/admin/categories/adminCategoryService.js
import prisma from "../../../../prisma/prisma.js";
import dayjs from "dayjs";
import { uploadFile, deleteFile, getPublicFileUrl } from "../../../common/services/fileService.js";

function formatCategory(category) {
  return {
    ...category,
    createdAtShamsi: category.createdAt
      ? dayjs(category.createdAt).format("YYYY/MM/DD")
      : null,
    fields: category.fields?.map((field) => ({
      id: field.id,
      name: field.name,
      type: field.type,
      required: field.required,
      options: field.options ? JSON.parse(field.options) : null,
    })) || [],
  };
}

// ----------------------------
// 📌 دریافت همه دسته‌بندی‌ها
// ----------------------------
export async function getAllCategories() {
  const categories = await prisma.category.findMany({
    include: { fields: true },
    orderBy: { name: "asc" },
  });
  return categories.map(formatCategory);
}

// ----------------------------
// 📌 دریافت دسته‌بندی با شناسه
// ----------------------------
export async function getCategoryById(id) {
  const categoryId = Number(id);
  if (!categoryId) throw new Error("شناسه دسته‌بندی معتبر نیست");

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    include: { fields: true },
  });

  if (!category) throw new Error("دسته‌بندی یافت نشد");
  return formatCategory(category);
}

// ----------------------------
// 📌 ایجاد دسته‌بندی
// ----------------------------
export async function addCategory(data, file) {
  let uploadedImage = null;
  try {
    // آپلود تصویر اگر ارسال شده باشد
    if (file) {
      uploadedImage = await uploadFile(file, "categories");
    }

    const category = await prisma.category.create({
      data: {
        name: data.name.trim(),
        image: uploadedImage ? uploadedImage.url : null,
        fields: data.fields?.length
          ? {
              create: data.fields.map((f) => ({
                name: f.name,
                type: f.type,
                required: f.required ?? true,
                options: f.options ? JSON.stringify(f.options) : null,
              })),
            }
          : undefined,
      },
      include: { fields: true },
    });

    return formatCategory(category);
  } catch (err) {
    if (uploadedImage) await deleteFile(uploadedImage.key);
    throw new Error("خطا در ایجاد دسته‌بندی: " + err.message);
  }
}

// ----------------------------
// 📌 بروزرسانی دسته‌بندی
// ----------------------------
export async function modifyCategory(id, data, file) {
  const categoryId = Number(id);
  if (!categoryId) throw new Error("شناسه دسته‌بندی معتبر نیست");

  const existing = await prisma.category.findUnique({
    where: { id: categoryId },
    include: { fields: true },
  });

  if (!existing) throw new Error("دسته‌بندی یافت نشد");

  let uploadedImage = null;
  try {
    // اگر تصویر جدید ارسال شده، تصویر قبلی حذف شود
    if (file) {
      if (existing.image) {
        const key = existing.image.split("/categories/")[1];
        if (key) await deleteFile(`categories/${key}`);
      }
      uploadedImage = await uploadFile(file, "categories");
    }

    // حذف فیلدهای قبلی و ایجاد جدید
    if (data.fields) {
      await prisma.categoryField.deleteMany({ where: { categoryId } });
    }

    const updated = await prisma.category.update({
      where: { id: categoryId },
      data: {
        name: data.name ?? existing.name,
        image: uploadedImage ? uploadedImage.url : existing.image,
        fields: data.fields?.length
          ? {
              create: data.fields.map((f) => ({
                name: f.name,
                type: f.type,
                required: f.required ?? true,
                options: f.options ? JSON.stringify(f.options) : null,
              })),
            }
          : undefined,
      },
      include: { fields: true },
    });

    return formatCategory(updated);
  } catch (err) {
    if (uploadedImage) await deleteFile(uploadedImage.key);
    throw new Error("خطا در بروزرسانی دسته‌بندی: " + err.message);
  }
}

// ----------------------------
// 📌 حذف دسته‌بندی
// ----------------------------
export async function removeCategory(id) {
  const categoryId = Number(id);
  if (!categoryId) throw new Error("شناسه دسته‌بندی معتبر نیست");

  const existing = await prisma.category.findUnique({
    where: { id: categoryId },
    include: { products: true, fields: true },
  });

  if (!existing) throw new Error("دسته‌بندی یافت نشد");
  if (existing.products.length > 0)
    throw new Error("امکان حذف دسته‌بندی دارای محصول وجود ندارد");

  if (existing.image) {
    const key = existing.image.split("/categories/")[1];
    if (key) await deleteFile(`categories/${key}`);
  }

  await prisma.categoryField.deleteMany({ where: { categoryId } });
  await prisma.category.delete({ where: { id: categoryId } });

  return { message: "دسته‌بندی با موفقیت حذف شد" };
}
