import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// لیست سفارش‌ها با فیلتر + جستجو + پیجینیشن
export async function getAllOrders({ page = 1, limit = 10, status, search }) {
  const skip = (page - 1) * limit;

  const where = {};
  if (status) where.status = status;
  if (search) {
    where.user = {
      OR: [
        { username: { contains: search } },
        { email: { contains: search } },
      ],
    };
  }

  const [orders, total, stats] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { user: true },
    }),
    prisma.order.count({ where }),
    prisma.order.groupBy({
      by: ["status"],
      _count: { status: true },
    }),
  ]);

  return { orders, total, stats };
}

// جزئیات سفارش
export async function getOrderById(id) {
  return prisma.order.findUnique({
    where: { id: Number(id) },
    include: {
      items: { include: { product: true } },
      user: true,
    },
  });
}

// بروزرسانی وضعیت + کد رهگیری
export async function updateOrderStatus(id, status, trackingCode) {
  return prisma.order.update({
    where: { id: Number(id) },
    data: {
      status,
      ...(status === "shipped" && trackingCode
        ? { shippingTrackingCode: trackingCode }
        : {}),
      updatedAt: new Date(),
    },
  });
}

// ثبت اطلاعات پرداخت
export async function updatePayment(id, { method, status, paidAt }) {
  return prisma.order.update({
    where: { id: Number(id) },
    data: {
      paymentMethod: method,
      paymentStatus: status,
      paidAt: paidAt || new Date(),
    },
  });
}
