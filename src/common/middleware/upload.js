// src/common/middleware/upload.js
import multer from "multer";

const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // مثال: 10MB محدودیت
  fileFilter: (req, file, cb) => {
    // فقط تصاویر مجاز
    if (/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("فرمت فایل پشتیبانی نمی‌شود. فقط jpeg/png/webp/gif مجاز است."));
    }
  },
});
