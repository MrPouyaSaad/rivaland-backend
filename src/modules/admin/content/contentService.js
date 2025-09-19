import { PrismaClient } from "@prisma/client";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

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
const BASE_IMAGE_URL =
  process.env.LIARA_CDN_URL || `${process.env.LIARA_ENDPOINT}/${BUCKET_NAME}`;

// ----------------------------
// 📌 Upload single image
// ----------------------------
async function uploadImage(file, folder = "banners") {
  if (!file) return null;
  const fileKey = `${folder}/${randomUUID()}-${file.originalname}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
      Body: file.buffer,
      ContentType: file.mimetype,
    })
  );

  return `${BASE_IMAGE_URL}/${fileKey.split("/").pop()}`;
}

// ----------------------------
// 📌 Delete image
// ----------------------------
async function deleteImage(url) {
  if (!url) return;
  const fileKey = url.split("/").slice(-2).join("/");
  await s3.send(
    new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
    })
  );
}

// ----------------------------
// 📌 Get all banners
// ----------------------------
export async function getAllBanners(type) {
  return prisma.banner.findMany({
    where: type ? { type } : {},
    orderBy: { createdAt: "desc" },
  });
}

// ----------------------------
// 📌 Get banner by id
// ----------------------------
export async function getBannerById(id) {
  return prisma.banner.findUnique({ where: { id: Number(id) } });
}

// ----------------------------
// 📌 Create multiple banners
// ----------------------------
export async function createMultipleBanners(filesObj) {
  const createdBanners = [];

  for (const type of ["slider", "small"]) {
    const files = filesObj[type] || [];
    for (const file of files) {
      const imageUrl = await uploadImage(file, "banners");
      const banner = await prisma.banner.create({
        data: { type, image: imageUrl, isActive: true },
      });
      createdBanners.push(banner);
    }
  }

  return createdBanners;
}

// ----------------------------
// 📌 Update single banner
// ----------------------------
export async function updateBanner(id, data, file) {
  const existing = await prisma.banner.findUnique({ where: { id: Number(id) } });
  if (!existing) throw new Error("بنر یافت نشد");

  let imageUrl = existing.image;
  if (file) {
    if (existing.image) await deleteImage(existing.image);
    imageUrl = await uploadImage(file, "banners");
  }

  return prisma.banner.update({
    where: { id: Number(id) },
    data: { ...data, image: imageUrl },
  });
}

// ----------------------------
// 📌 Delete banner
// ----------------------------
export async function deleteBanner(id) {
  const existing = await prisma.banner.findUnique({ where: { id: Number(id) } });
  if (!existing) throw new Error("بنر یافت نشد");

  if (existing.image) await deleteImage(existing.image);

  return prisma.banner.delete({ where: { id: Number(id) } });
}

// ----------------------------
// 📌 Toggle banner active/inactive
// ----------------------------
export async function toggleBannerActive(id, isActive) {
  return prisma.banner.update({
    where: { id: Number(id) },
    data: { isActive },
  });
}
