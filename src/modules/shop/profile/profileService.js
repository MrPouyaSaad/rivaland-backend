import prisma from "../../../prisma/prisma.js";

// ----------------------------
// 📌 پروفایل کاربر
// ----------------------------
export async function getProfile(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      email: true,
      phone: true,
      createdAt: true,
      // در صورت نیاز آدرس و آواتار اضافه می‌کنیم
    },
  });

  if (!user) {
    throw new Error("کاربر پیدا نشد");
  }

  return user;
}

export async function updateProfile(userId, data) {
  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        username: data.name,
        email: data.email,
        phone: data.phone,
        // اگر فیلد address داریم:
        address: data.address
      },
    });

    return updatedUser;
  } catch (error) {
    if (error.code === "P2002") {
      throw new Error("ایمیل یا شماره تلفن قبلا ثبت شده است");
    }
    throw new Error("خطا در بروزرسانی اطلاعات کاربر");
  }
}

// ----------------------------
// 📌 سفارش‌ها
// ----------------------------
export async function getOrders(userId, status) {
  const where = { userId };
  if (status) where.status = status;

  const orders = await prisma.order.findMany({
    where,
    include: {
      items: {
        include: {
          product: {
            select: { id: true, name: true, image: true, price: true }
          }
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return orders.map(order => ({
    id: `ORD-${order.id}`,
    date: order.createdAt,
    status: order.status,
    statusText: mapStatusText(order.status),
    items: order.items.map(i => ({
      productId: i.product.id,
      name: i.product.name,
      quantity: i.quantity,
      price: i.price,
      image: i.product.image
    })),
    total: order.total,
    trackingCode: order.shippingTrackingCode,
    shippingAddress: {
      name: order.user.username,
      address: order.user.address || "",
      phone: order.user.phone || ""
    },
    steps: generateSteps(order.status, order.updatedAt)
  }));
}

// لغو سفارش
export async function cancelOrder(userId, orderId) {
  const order = await prisma.order.findUnique({
    where: { id: orderId, userId }
  });

  if (!order) throw new Error("سفارش پیدا نشد");
  if (order.status === "cancelled") throw new Error("سفارش قبلاً لغو شده است");
  if (["delivered", "shipped"].includes(order.status))
    throw new Error("امکان لغو سفارش در این مرحله وجود ندارد");

  await prisma.order.update({
    where: { id: orderId },
    data: { status: "cancelled" }
  });

  return { message: "سفارش با موفقیت لغو شد" };
}

// آمار سفارش‌ها
export async function getOrderStats(userId) {
  const orders = await prisma.order.findMany({ where: { userId } });

  const stats = {
    active: orders.filter(o => !["cancelled", "delivered"].includes(o.status)).length,
    cancelled: orders.filter(o => o.status === "cancelled").length,
    returned: orders.filter(o => o.status === "returned").length,
    delivered: orders.filter(o => o.status === "delivered").length,
    total: orders.length
  };

  return stats;
}

// ----------------------------
// 🛠 توابع کمکی داخلی
// ----------------------------
function mapStatusText(status) {
  const map = {
    pending: "در حال بررسی",
    paid: "پرداخت شده",
    shipped: "ارسال شده",
    delivered: "تحویل داده شده",
    cancelled: "لغو شده",
    returned: "مرجوعی"
  };
  return map[status] || status;
}

function generateSteps(status, updatedAt) {
  const steps = [
    { name: "پرداخت", status: "completed", date: updatedAt },
    { name: "آماده سازی", status: status === "pending" ? "pending" : "completed", date: updatedAt },
    { name: "تحویل به پست", status: status === "shipped" ? "completed" : "pending", date: updatedAt }
  ];
  return steps;
}
