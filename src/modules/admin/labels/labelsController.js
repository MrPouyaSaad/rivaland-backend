import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 📌 دریافت همه لیبل‌ها
export const getAllLabels = async (req, res) => {
  try {
    const labels = await prisma.label.findMany({
      select: {
        id: true,
        name: true,
        title: true,
        color: true
      },
      orderBy: {
        id: "asc"
      }
    });

    res.json({
      success: true,
      data: labels,
      message: "لیست لیبل‌ها با موفقیت ارسال شد"
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
