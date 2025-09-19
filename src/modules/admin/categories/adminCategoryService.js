import { PrismaClient } from "@prisma/client";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

// پیکربندی صحیح S3 Client برای لیارا
const s3 = new S3Client({
  region: "default",
  endpoint: process.env.LIARA_ENDPOINT,
  credentials: {
    accessKeyId: process.env.LIARA_ACCESS_KEY,
    secretAccessKey: process.env.LIARA_SECRET_KEY,
  },
  forcePathStyle: true, // ضروری برای لیارا
});

const BUCKET_NAME = process.env.LIARA_BUCKET;
const BASE_IMAGE_URL = `${process.env.LIARA_ENDPOINT}/${BUCKET_NAME}`;

// 📌 آپلود تصویر روی لیارا
async function uploadImageToLiara(file) {
  if (!file) return null;
  
  const fileExtension = file.originalname.split('.').pop();
  const fileKey = `categories/${randomUUID()}.${fileExtension}`;

  try {
    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: fileKey,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read', // برای دسترسی عمومی به فایل
      })
    );
    
    return `${BASE_IMAGE_URL}/${fileKey}`;
  } catch (error) {
    console.error("خطا در آپلود تصویر:", error);
    throw new Error("خطا در آپلود تصویر");
  }
}

// 📌 حذف تصویر از لیارا
async function deleteImageFromLiara(url) {
  if (!url || !url.includes(BUCKET_NAME)) return;

  try {
    const urlParts = url.split('/');
    const fileKey = urlParts.slice(urlParts.indexOf(BUCKET_NAME) + 1).join('/');
    
    await s3.send(
      new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: fileKey,
      })
    );
  } catch (error) {
    console.error("خطا در حذف تصویر:", error);
    // خطا را نادیده می‌گیریم چون حذف فایل حیاتی نیست
  }
}

function formatCategory(category) {
  return {
    ...category,
    fields: category.fields ? category.fields.map(field => ({
      id: field.id,
      name: field.name,
      type: field.type,
      required: field.required,
      categoryId: field.categoryId,
      createdAt: field.createdAt,
      updatedAt: field.updatedAt
    })) : [],
    image: category.image || null,
  };
}

export const connect = () => prisma.$connect();
export const disconnect = () => prisma.$disconnect();

// 📌 دریافت همه دسته‌بندی‌ها با فیلدها
export async function getAllCategories() {
  try {
    const categories = await prisma.category.findMany({
      include: { 
        fields: true 
      },
      orderBy: { name: "asc" },
    });
    
    return categories.map(formatCategory);
  } catch (error) {
    throw new Error("خطا در دریافت دسته‌بندی‌ها: " + error.message);
  }
}

// 📌 دریافت دسته‌بندی با فیلدها
export async function getCategoryById(id) {
  try {
    const categoryId = parseInt(id);
    if (isNaN(categoryId) || categoryId <= 0) {
      throw new Error("شناسه دسته‌بندی معتبر نیست");
    }

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: { 
        fields: true 
      },
    });

    if (!category) throw new Error("دسته‌بندی یافت نشد");

    return formatCategory(category);
  } catch (error) {
    throw new Error("خطا در دریافت دسته‌بندی: " + error.message);
  }
}

// 📌 ایجاد دسته‌بندی با پشتیبانی از فیلدهای داینامیک
export async function addCategory(data, file) {
  try {
    if (!data.name || data.name.trim().length === 0) {
      throw new Error("نام دسته‌بندی الزامی است");
    }

    // بررسی تکراری نبودن نام
    const existingCategory = await prisma.category.findFirst({
      where: { 
        name: { 
          equals: data.name.trim(), 
          mode: "insensitive" 
        } 
      },
    });

    if (existingCategory) {
      throw new Error("دسته‌بندی با این نام قبلاً وجود دارد");
    }

    // آپلود تصویر
    let imageUrl = null;
    if (file) {
      imageUrl = await uploadImageToLiara(file);
    }

    // پردازش فیلدهای داینامیک
    let fieldsData = [];
    if (data.fields && Array.isArray(data.fields)) {
      fieldsData = data.fields.map(field => ({
        name: field.name,
        type: field.type,
        required: field.required !== undefined ? field.required : true,
        options: field.options ? JSON.stringify(field.options) : null
      }));
    }

    // ایجاد دسته‌بندی
    const category = await prisma.category.create({
      data: { 
        name: data.name.trim(), 
        image: imageUrl,
        fields: fieldsData.length > 0 ? { 
          create: fieldsData 
        } : undefined
      },
      include: { fields: true }
    });

    return formatCategory(category);
  } catch (error) {
    // حذف تصویر آپلود شده در صورت خطا
    if (file) {
      try {
        await deleteImageFromLiara(await uploadImageToLiara(file));
      } catch (deleteError) {
        console.error("خطا در حذف تصویر پس از خطا:", deleteError);
      }
    }
    throw new Error("خطا در ایجاد دسته‌بندی: " + error.message);
  }
}

// 📌 بروزرسانی دسته‌بندی
export async function modifyCategory(id, data, file) {
  try {
    const categoryId = parseInt(id);
    if (isNaN(categoryId) || categoryId <= 0) {
      throw new Error("شناسه دسته‌بندی معتبر نیست");
    }

    // بررسی وجود دسته‌بندی
    const category = await prisma.category.findUnique({ 
      where: { id: categoryId },
      include: { fields: true }
    });
    
    if (!category) throw new Error("دسته‌بندی یافت نشد");

    // بررسی تکراری نبودن نام
    if (data.name && data.name.trim().length > 0) {
      const duplicate = await prisma.category.findFirst({
        where: { 
          name: { 
            equals: data.name.trim(), 
            mode: "insensitive" 
          }, 
          id: { not: categoryId } 
        },
      });
      if (duplicate) {
        throw new Error("دسته‌بندی با این نام قبلاً وجود دارد");
      }
    }

    // مدیریت تصویر
    let imageUrl = category.image;
    if (file) {
      // حذف تصویر قبلی اگر وجود داشت
      if (category.image) {
        await deleteImageFromLiara(category.image);
      }
      imageUrl = await uploadImageToLiara(file);
    }

    // مدیریت فیلدها
    let fieldsUpdate = {};
    if (data.fields && Array.isArray(data.fields)) {
      // حذف فیلدهای قبلی
      await prisma.categoryField.deleteMany({ 
        where: { categoryId: categoryId } 
      });

      // ایجاد فیلدهای جدید
      const fieldsData = data.fields.map(field => ({
        name: field.name,
        type: field.type,
        required: field.required !== undefined ? field.required : true,
        options: field.options ? JSON.stringify(field.options) : null
      }));

      fieldsUpdate = { create: fieldsData };
    }

    // بروزرسانی دسته‌بندی
    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: {
        name: data.name ? data.name.trim() : category.name,
        image: imageUrl,
        fields: Object.keys(fieldsUpdate).length > 0 ? fieldsUpdate : undefined
      },
      include: { fields: true }
    });

    return formatCategory(updatedCategory);
  } catch (error) {
    throw new Error("خطا در بروزرسانی دسته‌بندی: " + error.message);
  }
}

// 📌 حذف دسته‌بندی
export async function removeCategory(id) {
  try {
    const categoryId = parseInt(id);
    if (isNaN(categoryId) || categoryId <= 0) {
      throw new Error("شناسه دسته‌بندی معتبر نیست");
    }

    // بررسی وجود دسته‌بندی و محصولات مرتبط
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: { 
        products: true,
        fields: true 
      },
    });

    if (!category) throw new Error("دسته‌بندی یافت نشد");
    
    // بررسی وجود محصولات
    if (category.products.length > 0) {
      throw new Error("امکان حذف دسته‌بندی دارای محصول وجود ندارد");
    }

    // حذف تصویر
    if (category.image) {
      await deleteImageFromLiara(category.image);
    }

    // حذف فیلدهای مرتبط
    if (category.fields.length > 0) {
      await prisma.categoryField.deleteMany({
        where: { categoryId: categoryId }
      });
    }

    // حذف دسته‌بندی
    const deletedCategory = await prisma.category.delete({ 
      where: { id: categoryId } 
    });

    return {
      id: deletedCategory.id,
      name: deletedCategory.name,
      message: "دسته‌بندی با موفقیت حذف شد"
    };
  } catch (error) {
    throw new Error("خطا در حذف دسته‌بندی: " + error.message);
  }
}

// 📌 دریافت دسته‌بندی‌ها بدون محصولات (فقط با فیلدها)
export async function getAllCategoriesWithoutProducts() {
  try {
    const categories = await prisma.category.findMany({
      include: { fields: true },
      orderBy: { name: "asc" }
    });
    
    return categories.map(formatCategory);
  } catch (error) {
    throw new Error("خطا در دریافت دسته‌بندی‌ها: " + error.message);
  }
}

// 📌 دریافت دسته‌بندی بدون محصولات (فقط با فیلدها)
export async function getCategoryByIdWithoutProducts(id) {
  try {
    const categoryId = parseInt(id);
    if (isNaN(categoryId) || categoryId <= 0) {
      throw new Error("شناسه دسته‌بندی معتبر نیست");
    }

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: { fields: true }
    });
    
    if (!category) throw new Error("دسته‌بندی یافت نشد");

    return formatCategory(category);
  } catch (error) {
    throw new Error("خطا در دریافت دسته‌بندی: " + error.message);
  }
}

// 📌 دریافت فیلدهای یک دسته‌بندی
export async function getCategoryFields(categoryId) {
  try {
    const id = parseInt(categoryId);
    if (isNaN(id) || id <= 0) {
      throw new Error("شناسه دسته‌بندی معتبر نیست");
    }

    const fields = await prisma.categoryField.findMany({
      where: { categoryId: id },
      orderBy: { name: "asc" }
    });

    return fields.map(field => ({
      id: field.id,
      name: field.name,
      type: field.type,
      required: field.required,
      options: field.options ? JSON.parse(field.options) : null,
      createdAt: field.createdAt,
      updatedAt: field.updatedAt
    }));
  } catch (error) {
    throw new Error("خطا در دریافت فیلدهای دسته‌بندی: " + error.message);
  }
}

// 📌 افزودن فیلد به دسته‌بندی
export async function addFieldToCategory(categoryId, fieldData) {
  try {
    const id = parseInt(categoryId);
    if (isNaN(id) || id <= 0) {
      throw new Error("شناسه دسته‌بندی معتبر نیست");
    }

    // بررسی وجود دسته‌بندی
    const category = await prisma.category.findUnique({
      where: { id: id }
    });
    
    if (!category) throw new Error("دسته‌بندی یافت نشد");

    // اعتبارسنجی فیلد
    if (!fieldData.name || fieldData.name.trim().length === 0) {
      throw new Error("نام فیلد الزامی است");
    }

    if (!fieldData.type || !['string', 'number', 'boolean', 'select', 'multi-select'].includes(fieldData.type)) {
      throw new Error("نوع فیلد معتبر نیست");
    }

    // ایجاد فیلد جدید
    const field = await prisma.categoryField.create({
      data: {
        name: fieldData.name.trim(),
        type: fieldData.type,
        required: fieldData.required !== undefined ? fieldData.required : true,
        options: fieldData.options ? JSON.stringify(fieldData.options) : null,
        categoryId: id
      }
    });

    return {
      ...field,
      options: field.options ? JSON.parse(field.options) : null
    };
  } catch (error) {
    throw new Error("خطا در افزودن فیلد: " + error.message);
  }
}

// 📌 حذف فیلد از دسته‌بندی
export async function removeFieldFromCategory(fieldId) {
  try {
    const id = parseInt(fieldId);
    if (isNaN(id) || id <= 0) {
      throw new Error("شناسه فیلد معتبر نیست");
    }

    const field = await prisma.categoryField.findUnique({
      where: { id: id }
    });

    if (!field) throw new Error("فیلد یافت نشد");

    const deletedField = await prisma.categoryField.delete({
      where: { id: id }
    });

    return {
      id: deletedField.id,
      name: deletedField.name,
      message: "فیلد با موفقیت حذف شد"
    };
  } catch (error) {
    throw new Error("خطا در حذف فیلد: " + error.message);
  }
}