// src/modules/admin/content/slider/sliderService.js
import prisma from "../../../../../prisma/prisma.js";
import { uploadMultipleFiles, deleteFile } from "../../../../common/services/fileService.js";

/**
 * 📌 دریافت همه اسلایدرها
 */
export async function getAllSliders() {
  return prisma.banner.findMany({
    where: { type: "slider" },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * 📌 ایجاد چند بنر اسلایدر
 */
export async function createSliders(files) {
  if (!files?.length) throw new Error("فایلی برای آپلود ارسال نشده است");

  const uploadedFiles = await uploadMultipleFiles(files, "slider");
  const created = [];

  for (const file of uploadedFiles) {
    const banner = await prisma.banner.create({
      data: {
        type: "slider",
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
 * 📌 حذف یک اسلایدر
 */
export async function deleteSlider(id) {
  const existing = await prisma.banner.findUnique({ where: { id: Number(id) } });
  if (!existing) throw new Error("اسلایدر یافت نشد");

  if (existing.imageKey) await deleteFile(existing.imageKey);

  return prisma.banner.delete({ where: { id: Number(id) } });
}

/**
 * 📌 تغییر وضعیت فعال/غیرفعال
 */
export async function toggleSliderStatus(id, isActive) {
  return prisma.banner.update({
    where: { id: Number(id) },
    data: { isActive },
  });
}
