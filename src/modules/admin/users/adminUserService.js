import prisma from "../../../../prisma/prisma.js";


/**
 * لیست کاربران با فیلتر و جستجو
 * @param {string} filter نوع فیلتر (all, active, inactive, buyers, no_buy, pending)
 * @param {string} search متن جستجو (اسم یا ایمیل)
 */
export async function getUsers(filter = "all", search = "") {
  let where = {};

  // فیلتر وضعیت
  if (filter === "active") where.isActive = true;
  else if (filter === "inactive") where.isActive = false;
  else if (filter === "buyers") where.orders = { some: {} };
  else if (filter === "no_buy") where.orders = { none: {} };
  else if (filter === "pending") where.orders = { some: { status: "pending" } };

  // جستجو با نام یا ایمیل
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  const users = await prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      orders: {
        select: { total: true, status: true },
      },
    },
  });

  // محاسبه تعداد سفارش و مجموع خرید
  return users.map((u) => {
    const orderCount = u.orders.length;
    const totalPurchase = u.orders
      .filter((o) => o.status === "paid")
      .reduce((sum, o) => sum + o.total, 0);

    return {
      id: u.id,
      name: u.name || "نامشخص",
      email: u.email || "ندارد",
      city: u.city || "نامشخص",
      createdAt: u.createdAt,
      lastLogin: u.lastLogin,
      orderCount,
      totalPurchase,
      status: u.isActive ? "active" : "inactive",
    };
  });
}

// حذف کاربر
export async function deleteUser(id) {
  return prisma.user.delete({ where: { id: Number(id) } });
}

// دریافت کاربر خاص (برای مشاهده پروفایل)
export async function getUserById(id) {
  const user = await prisma.user.findUnique({
    where: { id: Number(id) },
    include: {
      orders: { select: { total: true, status: true } },
    },
  });

  if (!user) return null;

  return {
    id: user.id,
    name: user.name || "نامشخص",
    email: user.email || "ندارد",
    city: user.city || "نامشخص",
    createdAt: user.createdAt,
    lastLogin: user.lastLogin,
    orderCount: user.orders.length,
    totalPurchase: user.orders
      .filter((o) => o.status === "paid")
      .reduce((sum, o) => sum + o.total, 0),
    status: user.isActive ? "active" : "inactive",
  };
}
