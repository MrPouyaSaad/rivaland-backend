// src/modules/admin/products/adminProductService.js
import prisma from "../../../../prisma/prisma.js";
import dayjs from "dayjs";
import {
  uploadMultipleFiles,
  deleteFile,
  getPublicFileUrl,
} from "../../../common/services/fileService.js";

function logYellow(message) {
  console.log(`\x1b[33m%s\x1b[0m`, message);
}

function formatAdminProduct(product) {
  return {
    ...product,
    image:
      product.images?.find((img) => img.isMain)?.url ||
      product.images?.[0]?.url ||
      null,
    images:
      product.images?.map((img) => ({
        url: img.url,
        key: img.key,
        isMain: img.isMain,
      })) || [],
    labels:
      product.labels?.map((rel) => ({
        id: rel.label.id,
        name: rel.label.name,
        title: rel.label.title,
      })) || [],
    createdAtShamsi: product.createdAt
      ? dayjs(product.createdAt).format("YYYY/MM/DD")
      : null,
    fields:
      product.attributes?.map((attr) => ({
        id: attr.fieldId,
        title: attr.field.name,
        type: attr.field.type,
        required: attr.field.required,
        options: attr.field.options ? JSON.parse(attr.field.options) : null,
        value: attr.value,
      })) || [],
  };
}

// ----------------------------
// 📌 Admin: List products
// ----------------------------
export async function getAllProducts(query) {
  const { categoryId, status, minPrice, maxPrice, search, page = 1, limit = 10 } =
    query;
  const where = {};
  if (categoryId) where.categoryId = Number(categoryId);
  if (status) where.isActive = status === "active";
  if (minPrice || maxPrice) where.price = {};
  if (minPrice) where.price.gte = Number(minPrice);
  if (maxPrice) where.price.lte = Number(maxPrice);
  if (search) where.name = { contains: search, mode: "insensitive" };

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  try {
    logYellow(`Fetching products - page: ${page}, limit: ${limit}`);
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          images: true,
          attributes: { include: { field: true } },
          labels: { include: { label: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.product.count({ where }),
    ]);
    return {
      data: products.map(formatAdminProduct),
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (err) {
    console.error("Fetch products failed:", err);
    throw new Error("دریافت محصولات با مشکل مواجه شد");
  }
}

// ----------------------------
// 📌 Get product by id
// ----------------------------
export async function getProductById(id) {
  try {
    logYellow(`Fetching product by id: ${id}`);
    const product = await prisma.product.findUnique({
      where: { id: Number(id) },
      include: {
        category: { include: { fields: true } },
        images: true,
        attributes: { include: { field: true } },
        labels: { include: { label: true } },
      },
    });
    if (!product) return null;
    return formatAdminProduct(product);
  } catch (err) {
    console.error("Fetch product failed:", err);
    throw new Error("دریافت محصول با مشکل مواجه شد");
  }
}

// ----------------------------
// 📌 Create product (with multiple images)
// ----------------------------
export async function createProduct(data, files = []) {
  const { categoryId, fields, labels, ...rest } = data;
  logYellow(`Starting product creation: ${rest.name}`);

  // 🔥 آپلود چندین فایل با سرویس مشترک
  const uploadedImages = await uploadMultipleFiles(files, "products");

  try {
    logYellow(`Inserting product into database: ${rest.name}`);
    const product = await prisma.product.create({
      data: {
        ...rest,
        discount: data.discount || 0,
        discountType: data.discountType || "amount",
        category: categoryId
          ? { connect: { id: Number(categoryId) } }
          : undefined,
           label: labelId ? { connect: { id: Number(labelId) } } : undefined,
        images: {
          create: uploadedImages.map((img, i) => ({
            url: img.url,
            key: img.key,
            isMain: i === 0, // اولین عکس رو پیش‌فرض اصلی می‌ذاریم
          })),
        },
      },
      include: {
        category: { include: { fields: true } },
        images: true,
        labels: true,
      },
    });

    // فیلدهای سفارشی
    if (fields && Array.isArray(fields)) {
      for (const f of fields) {
        await prisma.productFieldValue.create({
          data: { productId: product.id, fieldId: f.fieldId, value: f.value },
        });
      }
    }

    // لیبل‌ها
    if (labels && Array.isArray(labels)) {
      await prisma.productLabelRelation.createMany({
        data: labels.map((labelId) => ({
          productId: product.id,
          labelId: Number(labelId),
        })),
      });
    }

    return formatAdminProduct(await getProductById(product.id));
  } catch (err) {
    console.error("Create product failed:", err);
    for (const img of uploadedImages) {
      try {
        await deleteFile(img.key);
      } catch (deleteErr) {
        console.error("Failed to delete uploaded image:", deleteErr);
      }
    }
    throw new Error("ایجاد محصول با مشکل مواجه شد");
  }
}

// ----------------------------
// 📌 Update product
// ----------------------------
export async function updateProduct(id, data, files = []) {
  const existing = await prisma.product.findUnique({
    where: { id: Number(id) },
    include: { images: true, labels: true },
  });
  if (!existing) throw new Error("محصول یافت نشد");

  const { categoryId, fields,labelId, labels, ...rest } = data;
  const updateData = {
    ...rest,
    discount: data.discount || 0,
    discountType: data.discountType || "amount",
  };
  if (categoryId)
    updateData.category = { connect: { id: Number(categoryId) } };

    updateData.label = labelId
    ? { connect: { id: Number(labelId) } }
    : { disconnect: true };

  // اگر عکس جدیدی آپلود شده:
  if (files?.length > 0) {
    // حذف تصاویر قبلی
    for (const img of existing.images) await deleteFile(img.key);
    await prisma.productImage.deleteMany({ where: { productId: existing.id } });

    // آپلود تصاویر جدید
    const uploadedImages = await uploadMultipleFiles(files, "products");
    updateData.images = {
      create: uploadedImages.map((img, i) => ({
        url: img.url,
        key: img.key,
        isMain: i === 0,
      })),
    };
  }

  try {
    const updated = await prisma.product.update({
      where: { id: Number(id) },
      data: updateData,
      include: {
        category: { include: { fields: true } },
        images: true,
        labels: { include: { label: true } },
      },
    });

    // فیلدها
    if (fields) {
      await prisma.productFieldValue.deleteMany({
        where: { productId: updated.id },
      });
      for (const f of fields) {
        await prisma.productFieldValue.create({
          data: { productId: updated.id, fieldId: f.fieldId, value: f.value },
        });
      }
    }

    // لیبل‌ها
    if (labels) {
      await prisma.productLabelRelation.deleteMany({
        where: { productId: updated.id },
      });
      await prisma.productLabelRelation.createMany({
        data: labels.map((labelId) => ({
          productId: updated.id,
          labelId: Number(labelId),
        })),
      });
    }

    return formatAdminProduct(await getProductById(updated.id));
  } catch (err) {
    console.error("Update product failed:", err);
    throw new Error("بروزرسانی محصول با مشکل مواجه شد");
  }
}

// ----------------------------
// 📌 Delete product
// ----------------------------
export async function deleteProduct(id) {
  const existing = await prisma.product.findUnique({
    where: { id: Number(id) },
    include: { images: true },
  });
  if (!existing) throw new Error("محصول یافت نشد");

  for (const img of existing.images) await deleteFile(img.key);
  await prisma.productImage.deleteMany({ where: { productId: id } });
  await prisma.productFieldValue.deleteMany({ where: { productId: id } });
  await prisma.productLabelRelation.deleteMany({ where: { productId: id } });

  try {
    return prisma.product.delete({ where: { id: Number(id) } });
  } catch (err) {
    console.error("Delete product failed:", err);
    throw new Error("حذف محصول با مشکل مواجه شد");
  }
}

// ----------------------------
// 📌 Migration Helper
// ----------------------------
export async function migrateToPermanentUrls() {
  const products = await prisma.product.findMany({ include: { images: true } });
  let updatedCount = 0;

  for (const product of products) {
    for (const image of product.images) {
      if (image.key && !image.url.includes("liara")) {
        const permanentUrl = getPublicFileUrl(image.key);
        try {
          await prisma.productImage.update({
            where: { id: image.id },
            data: { url: permanentUrl },
          });
          updatedCount++;
        } catch (err) {
          console.error("Migration failed for image:", image.id, err);
        }
      }
    }
  }

  logYellow(`Migration complete. Total updated images: ${updatedCount}`);
  return { updatedCount };
}
