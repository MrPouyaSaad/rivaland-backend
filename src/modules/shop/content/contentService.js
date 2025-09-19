import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ----------------------------
// 📌 Get small banners (header)
// ----------------------------
export async function getSmallBanners() {
  console.log("Fetching small banners for header...");
  try {
    const banners = await prisma.banner.findMany({
      where: { type: "small", isActive: true },
      orderBy: { createdAt: "desc" },
      select: { id: true, image: true, link: true }, // فقط اطلاعات ضروری
    });
    console.log(`Fetched ${banners.length} small banners`);
    return banners;
  } catch (error) {
    console.error("Error fetching small banners:", error.message);
    throw new Error("خطا در دریافت بنرهای کوچک");
  }
}

// ----------------------------
// 📌 Get slider banners (main body)
// ----------------------------
export async function getSliderBanners() {
  console.log("Fetching slider banners for main body...");
  try {
    const banners = await prisma.banner.findMany({
      where: { type: "slider", isActive: true },
      orderBy: { createdAt: "desc" },
    });
    console.log(`Fetched ${banners.length} slider banners`);
    return banners;
  } catch (error) {
    console.error("Error fetching slider banners:", error.message);
    throw new Error("خطا در دریافت بنرهای بزرگ");
  }
}
