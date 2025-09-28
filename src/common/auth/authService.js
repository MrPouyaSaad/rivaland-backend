import { generateToken } from "../utils/jwt.js";
import prisma from "../../../prisma/prisma.js";

import { MessageService } from "../messaging/messageService.js";




export async function login(username, password) {
  // ورود ادمین
  if (
    username === process.env.ADMIN_USER &&
    password === process.env.ADMIN_PASS
  ) {
    const token = generateToken({ role: "admin" });
    return { token, role: "admin" };
  }

  throw new Error("Invalid credentials");
}

// ✅ مرحله ۱: درخواست کد تأیید
export async function requestLoginCode(phone) {
  const code = Math.floor(10000 + Math.random() * 90000).toString();

  // ذخیره یا آپدیت کد
  await prisma.loginCode.upsert({
    where: { phone },
    update: { code, expiresAt: new Date(Date.now() + 2 * 60 * 1000) },
    create: { phone, code, expiresAt: new Date(Date.now() + 2 * 60 * 1000) },
  });

  await MessageService.sendMessage({
    to: phone,
    content: `کد ورود شما: ${code}`,
    type: "login-code",
  });

  return { success: true, message: "کد ارسال شد" };
}

/**
 * مرحله دوم: بررسی کد و ساخت/ورود کاربر
 */
export async function verifyLoginCode(phone, code) {
  const record = await prisma.loginCode.findUnique({ where: { phone } });

  if (!record || record.code !== code || record.expiresAt < new Date()) {
    throw new Error("کد نامعتبر یا منقضی شده است");
  }

  // جستجوی کاربر بر اساس شماره
  let user = await prisma.user.findUnique({ where: { phone } });

  if (!user) {
    // ثبت نام خودکار
    user = await prisma.user.create({
      data: {
        phone,
        username: `user_${Date.now()}`, // مقدار پیش‌فرض
        password: "",                  // خالی چون با کد وارد می‌شه
        role: "user",
      },
    });
  }

  // ساخت توکن با اعتبار یک هفته
  const token = generateToken({ id: user.id, role: user.role }, "7d");

  // پاک کردن کد استفاده‌شده
  await prisma.loginCode.delete({ where: { phone } });

  return { token, role: user.role, isNewUser: !record.userId };
}
