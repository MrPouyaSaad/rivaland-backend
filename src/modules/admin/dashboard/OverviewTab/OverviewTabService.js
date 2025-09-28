import prisma from "../../../../../prisma/prisma.js";


export const getOverviewStats = async () => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // ----------------------
    // 1️⃣ KPIهای اصلی
    // ----------------------
    const revenueThisMonth = await prisma.order.aggregate({
      _sum: { total: true },
      where: { createdAt: { gte: startOfMonth } },
    });
    const revenueLastMonth = await prisma.order.aggregate({
      _sum: { total: true },
      where: { createdAt: { gte: startOfPrevMonth, lte: endOfPrevMonth } },
    });

    const ordersThisMonth = await prisma.order.count({
      where: { createdAt: { gte: startOfMonth } },
    });
    const ordersLastMonth = await prisma.order.count({
      where: { createdAt: { gte: startOfPrevMonth, lte: endOfPrevMonth } },
    });

    const customersThisMonth = await prisma.user.count({
      where: { createdAt: { gte: startOfMonth } },
    });
    const customersLastMonth = await prisma.user.count({
      where: { createdAt: { gte: startOfPrevMonth, lte: endOfPrevMonth } },
    });

    const avgBasketThisMonth = revenueThisMonth._sum.total / (ordersThisMonth || 1);
    const avgBasketLastMonth = revenueLastMonth._sum.total / (ordersLastMonth || 1);

    const calcGrowth = (current, prev) => (prev ? ((current - prev) / prev) * 100 : 100);

    // ----------------------
    // 2️⃣ نمودار عملکرد فروش هفتگی
    // ----------------------
    const weeklyOrders = await prisma.order.findMany({
      where: { createdAt: { gte: startOfMonth } },
      select: { createdAt: true, total: true },
    });

    const weeklyChart = {};
    weeklyOrders.forEach(order => {
      const day = order.createdAt.getDate();
      if (!weeklyChart[day]) weeklyChart[day] = { revenue: 0, orders: 0 };
      weeklyChart[day].revenue += order.total;
      weeklyChart[day].orders += 1;
    });

    const weeklyChartArray = Object.keys(weeklyChart)
      .sort((a,b)=> a-b)
      .map(day => ({
        day: Number(day),
        revenue: weeklyChart[day].revenue,
        orders: weeklyChart[day].orders,
      }));

    // ----------------------
    // 3️⃣ نمودار عملکرد فروش ماهانه
    // ----------------------
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const monthlyOrders = await prisma.order.findMany({
      where: { createdAt: { gte: startOfYear } },
      select: { createdAt: true, total: true },
    });

    const monthlyChart = {};
    monthlyOrders.forEach(order => {
      const month = order.createdAt.getMonth() + 1;
      if (!monthlyChart[month]) monthlyChart[month] = { revenue: 0, orders: 0 };
      monthlyChart[month].revenue += order.total;
      monthlyChart[month].orders += 1;
    });

    const monthlyChartArray = Object.keys(monthlyChart)
      .sort((a,b)=> a-b)
      .map(month => ({
        month: Number(month),
        revenue: monthlyChart[month].revenue,
        orders: monthlyChart[month].orders,
      }));

    // ----------------------
    // 4️⃣ پرفروش‌ترین و کم‌فروش‌ترین محصولات (5 عدد)
    // ----------------------
    const topProducts = await prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    });

    const lowProducts = await prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "asc" } },
      take: 5,
    });

    // برای فرانت‌اند جزئیات محصولات رو هم اضافه می‌کنیم
    const topProductsDetails = await Promise.all(
      topProducts.map(async p => {
        const product = await prisma.product.findUnique({ where: { id: p.productId } });
        return { ...product, sold: p._sum.quantity };
      })
    );

    const lowProductsDetails = await Promise.all(
      lowProducts.map(async p => {
        const product = await prisma.product.findUnique({ where: { id: p.productId } });
        return { ...product, sold: p._sum.quantity };
      })
    );

    // ----------------------
    // نتیجه نهایی
    // ----------------------
    return {
      revenue: {
        value: revenueThisMonth._sum.total || 0,
        growth: calcGrowth(revenueThisMonth._sum.total || 0, revenueLastMonth._sum.total || 0),
      },
      orders: {
        value: ordersThisMonth,
        growth: calcGrowth(ordersThisMonth, ordersLastMonth),
      },
      customers: {
        value: customersThisMonth,
        growth: calcGrowth(customersThisMonth, customersLastMonth),
      },
      avgBasket: {
        value: avgBasketThisMonth,
        growth: calcGrowth(avgBasketThisMonth, avgBasketLastMonth),
      },
      weeklyChart: weeklyChartArray,
      monthlyChart: monthlyChartArray,
      topProducts: topProductsDetails,
      lowProducts: lowProductsDetails,
    };
  } catch (error) {
    console.error("❌ خطا در سرویس نمای کلی:", error);
    throw new Error("خطایی در دریافت آمار نمای کلی رخ داده است.");
  }
};
