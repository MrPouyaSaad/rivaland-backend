import prisma from "../../../../../prisma/prisma.js";
import { uploadMultipleFiles, deleteFile } from "../../../../common/services/fileService.js";

/**
 * 📌 دریافت همه بنرهای محصولات
 */
export async function getAllProductsBanners() {
  return prisma.banner.findMany({
    where: { type: "productsbanner" },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * 📌 ایجاد چند بنر محصولات
 */
export async function createProductsBanners(files) {
  if (!files?.length) throw new Error("فایلی برای آپلود ارسال نشده است");

  const uploadedFiles = await uploadMultipleFiles(files, "productsbanner");
  const created = [];

  for (const file of uploadedFiles) {
    const banner = await prisma.banner.create({
      data: {
        type: "productsbanner",
        image: file.url,
        imageKey: file.key,
        isActive: true,
      },
    });
    created.push(banner);
  }

  return created;
}

/**
 * 📌 حذف یک بنر محصولات
 */
export async function deleteProductsBanner(id) {
  const existing = await prisma.banner.findUnique({ where: { id: Number(id) } });
  if (!existing) throw new Error("بنر یافت نشد");

  if (existing.imageKey) await deleteFile(existing.imageKey);

  return prisma.banner.delete({ where: { id: Number(id) } });
}

/**
 * 📌 تغییر وضعیت فعال/غیرفعال
 */
export async function toggleProductsBannerStatus(id, isActive) {
  return prisma.banner.update({
    where: { id: Number(id) },
    data: { isActive },
  });
}
