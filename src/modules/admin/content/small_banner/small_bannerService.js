import prisma from "../../../../../prisma/prisma.js";
import { uploadMultipleFiles, deleteFile } from "../../../../common/services/fileService.js";

/**
 * 📌 دریافت همه بنرهای کوچک
 */
export async function getAllSmallBanners() {
  return prisma.banner.findMany({
    where: { type: "smallbanner" },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * 📌 ایجاد چند بنر کوچک
 */
export async function createSmallBanners(files) {
  if (!files?.length) throw new Error("فایلی برای آپلود ارسال نشده است");

  const uploadedFiles = await uploadMultipleFiles(files, "smallbanner");
  const created = [];

  for (const file of uploadedFiles) {
    const banner = await prisma.banner.create({
      data: {
        type: "smallbanner",
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
 * 📌 حذف یک بنر کوچک
 */
export async function deleteSmallBanner(id) {
  const existing = await prisma.banner.findUnique({ where: { id: Number(id) } });
  if (!existing) throw new Error("بنر یافت نشد");

  if (existing.imageKey) await deleteFile(existing.imageKey);

  return prisma.banner.delete({ where: { id: Number(id) } });
}

/**
 * 📌 تغییر وضعیت فعال/غیرفعال
 */
export async function toggleSmallBannerStatus(id, isActive) {
  return prisma.banner.update({
    where: { id: Number(id) },
    data: { isActive },
  });
}
