// src/common/services/fileService.js
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import dotenv from "dotenv";

dotenv.config();

const s3 = new S3Client({
  region: "default",
  endpoint: process.env.LIARA_ENDPOINT,
  credentials: {
    accessKeyId: process.env.LIARA_ACCESS_KEY,
    secretAccessKey: process.env.LIARA_SECRET_KEY,
  },
});

const BUCKET_NAME = process.env.LIARA_BUCKET;
const PUBLIC_URL = `https://${BUCKET_NAME}.${process.env.LIARA_ENDPOINT.replace(/^https?:\/\//, "")}`;

// 🎨 رنگ‌های ANSI
const logColors = {
  yellow: (msg) => console.log(`\x1b[33m%s\x1b[0m`, msg),
  green: (msg) => console.log(`\x1b[32m%s\x1b[0m`, msg),
  red: (msg) => console.log(`\x1b[31m%s\x1b[0m`, msg),
  blue: (msg) => console.log(`\x1b[36m%s\x1b[0m`, msg),
};

function generateSafeFileName(file, folder) {
  const ext = file.originalname?.split(".").pop() || "jpg";
  return `${folder}/${randomUUID()}-${Date.now()}.${ext}`;
}

/**
 * 📌 آپلود یک فایل
 */
export async function uploadFile(file, folder = "uploads") {
  if (!file) return null;
  const fileKey = generateSafeFileName(file, folder);

  try {
    logColors.yellow(`🚀 [Upload] شروع آپلود: ${file.originalname}`);
    logColors.blue(`📁 مسیر مقصد: ${fileKey}`);

    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: fileKey,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: "public-read",
      })
    );

    const url = `${PUBLIC_URL}/${fileKey}`;
    logColors.green(`✅ آپلود موفقیت‌آمیز شد`);
    logColors.blue(`🔗 لینک فایل: ${url}`);

    return { url, key: fileKey };
  } catch (err) {
    logColors.red("❌ آپلود با خطا مواجه شد:");
    console.error(err);
    throw new Error("آپلود تصویر با مشکل مواجه شد");
  }
}

/**
 * 📌 آپلود چندین فایل
 */
export async function uploadMultipleFiles(files, folder = "uploads") {
  const results = [];
  for (const file of files) {
    const uploaded = await uploadFile(file, folder);
    if (uploaded) results.push(uploaded);
  }
  return results;
}

/**
 * 📌 حذف فایل
 */
export async function deleteFile(fileKey) {
  if (!fileKey) return;
  try {
    logColors.yellow(`🗑 [Delete] حذف فایل: ${fileKey}`);
    await s3.send(new DeleteObjectCommand({ Bucket: BUCKET_NAME, Key: fileKey }));
    logColors.green(`✅ حذف موفقیت‌آمیز`);
  } catch (err) {
    logColors.red("❌ حذف با خطا مواجه شد:");
    console.error(err);
    throw new Error("حذف تصویر با مشکل مواجه شد");
  }
}

export function getPublicFileUrl(fileKey) {
  return `${PUBLIC_URL}/${fileKey}`;
}
