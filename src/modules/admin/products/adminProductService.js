// src/services/adminProductService.js
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import { PrismaClient } from "@prisma/client";
import dayjs from "dayjs";
import dotenv from "dotenv";

dotenv.config();
const prisma = new PrismaClient();

const s3 = new S3Client({
  region: "default",
  endpoint: process.env.LIARA_ENDPOINT,
  credentials: {
    accessKeyId: process.env.LIARA_ACCESS_KEY,
    secretAccessKey: process.env.LIARA_SECRET_KEY,
  },
});

const BUCKET_NAME = process.env.LIARA_BUCKET;
const LIARA_ENDPOINT = process.env.LIARA_ENDPOINT;
const PUBLIC_URL = `https://${BUCKET_NAME}.${LIARA_ENDPOINT.replace(/^https?:\/\//, '')}`;

function logYellow(message) {
  console.log(`\x1b[33m%s\x1b[0m`, message);
}

function generateSafeFileName(file) {
  const ext = file.originalname?.split('.').pop() || "jpg";
  return `image_${Date.now()}.${ext}`;
}

export async function uploadImageToLiara(file) {
  if (!file) return null;
  const safeFileName = generateSafeFileName(file);
  const fileKey = `products/${randomUUID()}-${safeFileName}`;
  try {
    logYellow(`Uploading file: ${file.originalname} -> ${fileKey}`);
    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: fileKey,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: "public-read"
      })
    );
    const url = `${PUBLIC_URL}/${fileKey}`;
    logYellow(`Upload successful: ${url}`);
    return { url, key: fileKey };
  } catch (err) {
    console.error("Upload failed:", err);
    throw new Error("آپلود تصویر با مشکل مواجه شد");
  }
}

export async function deleteImageFromLiara(fileKey) {
  if (!fileKey) return;
  try {
    logYellow(`Deleting file from Liara: ${fileKey}`);
    await s3.send(new DeleteObjectCommand({ Bucket: BUCKET_NAME, Key: fileKey }));
    logYellow("Delete successful");
  } catch (err) {
    console.error("Delete failed:", err);
    throw new Error("حذف تصویر با مشکل مواجه شد");
  }
}

export function getPublicImageUrl(fileKey) {
  if (!fileKey) return null;
  return `${PUBLIC_URL}/${fileKey}`;
}

function formatAdminProduct(product) {
  return {
    ...product,
    image: product.images?.find(img => img.isMain)?.url || product.images?.[0]?.url || null,
    images: product.images?.map(img => ({ url: img.url, key: img.key, isMain: img.isMain })) || [],
    labels: product.labels?.map(rel => ({ id: rel.label.id, name: rel.label.name, title: rel.label.title })) || [],
    createdAtShamsi: product.createdAt ? dayjs(product.createdAt).format("YYYY/MM/DD") : null,
    fields: product.attributes?.map(attr => ({
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
// 📌 Admin: List all products
// ----------------------------
export async function getAllProducts(query) {
  const { categoryId, status, minPrice, maxPrice, search, page = 1, limit = 10 } = query;
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
    logYellow(`Fetched ${products.length} products out of ${total}`);
    return {
      data: products.map(formatAdminProduct),
      pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) },
    };
  } catch (err) {
    console.error("Fetch products failed:", err);
    throw new Error("دریافت محصولات با مشکل مواجه شد");
  }
}

export async function getProductById(id) {
  try {
    logYellow(`Fetching product by id: ${id}`);
    const product = await prisma.product.findUnique({
      where: { id: Number(id) },
      include: { category: { include: { fields: true } }, images: true, attributes: { include: { field: true } }, labels: { include: { label: true } } },
    });
    if (!product) {
      console.warn("Product not found");
      return null;
    }
    return formatAdminProduct(product);
  } catch (err) {
    console.error("Fetch product failed:", err);
    throw new Error("دریافت محصول با مشکل مواجه شد");
  }
}

export async function createProduct(data, files = []) {
  const { categoryId, fields, labels, ...rest } = data;
  const imageObjs = [];
  logYellow(`Starting product creation: ${rest.name}`);

  let filesArray = [];
  if (Array.isArray(files)) {
    filesArray = files.filter(f => f && f.originalname);
  } else if (files && files.originalname) {
    filesArray = [files];
  }

  for (const file of filesArray) {
    logYellow(`Processing file: ${file.originalname}`);
    const uploaded = await uploadImageToLiara(file);
    if (uploaded) {
      imageObjs.push(uploaded);
    }
  }

  try {
    logYellow(`Inserting product into database: ${rest.name}`);
    const mainImageUrl = imageObjs[0]?.url || null;

    const product = await prisma.product.create({
      data: {
        ...rest,
        discount: data.discount || 0,
        discountType: data.discountType || "amount",
        category: categoryId ? { connect: { id: Number(categoryId) } } : undefined,
        image: mainImageUrl,
        images: { create: imageObjs.map((img, i) => ({ url: img.url, key: img.key, isMain: i === 0 })) },
      },
      include: { category: { include: { fields: true } }, images: true },
    });

    if (fields && Array.isArray(fields)) {
      for (const f of fields) {
        logYellow(`Inserting field value: fieldId=${f.fieldId}, value=${f.value}`);
        await prisma.productFieldValue.create({ data: { productId: product.id, fieldId: f.fieldId, value: f.value } });
      }
    }

    if (labels && Array.isArray(labels)) {
      await prisma.productLabelRelation.createMany({
        data: labels.map(labelId => ({ productId: product.id, labelId: Number(labelId) })),
      });
    }

    logYellow(`Product created successfully: ${product.id}`);
    return formatAdminProduct(await getProductById(product.id));
  } catch (err) {
    console.error("Create product failed:", err);
    for (const img of imageObjs) {
      try { await deleteImageFromLiara(img.key); } catch (deleteErr) { console.error("Failed to delete uploaded image:", deleteErr); }
    }
    throw new Error("ایجاد محصول با مشکل مواجه شد");
  }
}

export async function updateProduct(id, data, files = null) {
  const existing = await prisma.product.findUnique({ where: { id: Number(id) }, include: { images: true, labels: true } });
  if (!existing) throw new Error("محصول یافت نشد");

  const { categoryId, fields, labels, ...rest } = data;
  const updateData = { ...rest, discount: data.discount || 0, discountType: data.discountType || "amount" };
  if (categoryId) updateData.category = { connect: { id: Number(categoryId) } };

  if (files) {
    let filesArray = [];
    if (Array.isArray(files)) { filesArray = files.filter(f => f && f.originalname); }
    else if (files && files.originalname) { filesArray = [files]; }

    for (const img of existing.images) await deleteImageFromLiara(img.key);
    await prisma.productImage.deleteMany({ where: { productId: existing.id } });

    const imageObjs = [];
    for (const file of filesArray) {
      const uploaded = await uploadImageToLiara(file);
      if (uploaded) imageObjs.push(uploaded);
    }
    updateData.images = { create: imageObjs.map((img, i) => ({ url: img.url, key: img.key, isMain: i === 0 })) };
  }

  try {
    logYellow(`Updating product: ${id}`);
    const updated = await prisma.product.update({
      where: { id: Number(id) },
      data: updateData,
      include: { category: { include: { fields: true } }, images: true, labels: { include: { label: true } } },
    });

    if (fields && Array.isArray(fields)) {
      await prisma.productFieldValue.deleteMany({ where: { productId: updated.id } });
      for (const f of fields) {
        logYellow(`Updating field value: fieldId=${f.fieldId}, value=${f.value}`);
        await prisma.productFieldValue.create({ data: { productId: updated.id, fieldId: f.fieldId, value: f.value } });
      }
    }

    if (labels && Array.isArray(labels)) {
      await prisma.productLabelRelation.deleteMany({ where: { productId: updated.id } });
      await prisma.productLabelRelation.createMany({
        data: labels.map(labelId => ({ productId: updated.id, labelId: Number(labelId) })),
      });
    }

    logYellow(`Product updated successfully: ${updated.id}`);
    return formatAdminProduct(await getProductById(updated.id));
  } catch (err) {
    console.error("Update product failed:", err);
    throw new Error("بروزرسانی محصول با مشکل مواجه شد");
  }
}

export async function deleteProduct(id) {
  const existing = await prisma.product.findUnique({ where: { id: Number(id) }, include: { images: true } });
  if (!existing) throw new Error("محصول یافت نشد");

  for (const img of existing.images) await deleteImageFromLiara(img.key);
  await prisma.productImage.deleteMany({ where: { productId: id } });
  await prisma.productFieldValue.deleteMany({ where: { productId: id } });
  await prisma.productLabelRelation.deleteMany({ where: { productId: id } });

  try {
    logYellow(`Deleting product: ${id}`);
    const deleted = await prisma.product.delete({ where: { id: Number(id) } });
    logYellow(`Product deleted successfully: ${id}`);
    return deleted;
  } catch (err) {
    console.error("Delete product failed:", err);
    throw new Error("حذف محصول با مشکل مواجه شد");
  }
}

export async function migrateToPermanentUrls() {
  const products = await prisma.product.findMany({ include: { images: true } });
  let updatedCount = 0;

  for (const product of products) {
    for (const image of product.images) {
      if (image.key && (!image.url.includes(PUBLIC_URL))) {
        const permanentUrl = getPublicImageUrl(image.key);
        try {
        