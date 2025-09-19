import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getDashboardSummary = async () => {
  try {
    // فروش کل
    const revenue = await prisma.order.aggregate({
      _sum: { total: true },
    });

    // تعداد کل سفارشات
    const orders = await prisma.order.count();

    // تعداد کل کاربران
    const users = await prisma.user.count();

    return {
      revenue: revenue._sum.total || 0,
      orders,
      users,
    };
  } catch (error) {
    console.error("❌ خطا در سرویس آمار کلی داشبورد:", error);
    throw new Error("خطایی در دریافت آمار کلی داشبورد رخ داده است.");
  }
};
