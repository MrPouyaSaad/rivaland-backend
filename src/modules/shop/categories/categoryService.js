import prisma from "../../../../prisma/prisma.js";

// ----------------------------
// 📌 Get all categories
// ----------------------------
export async function getAllCategories() {
  console.log("Fetching all categories...");
  try {
    const categories = await prisma.category.findMany({
      orderBy: { createdAt: "desc" },
    });
    console.log(`Fetched ${categories.length} categories`);
    return categories;
  } catch (error) {
    console.error("Error fetching categories:", error.message);
    throw new Error("خطا در دریافت دسته‌بندی‌ها");
  }
}
