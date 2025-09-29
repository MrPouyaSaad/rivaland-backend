import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const labels = [
    { name: "bestseller", title: "پرفروش", color: "#FF4500" },
    { name: "discounted", title: "پر تخفیف", color: "#32CD32" },
    { name: "recommended", title: "پیشنهادی", color: "#1E90FF" },
    { name: "new", title: "جدید", color: "#FFD700" },
    { name: "limited", title: "تعداد محدود", color: "#FF1493" },
    { name: "pack", title: "پک", color: "#8A2BE2" },
    { name: "special", title: "ویژه", color: "#FF6347" },
    { name: "seasonal", title: "مناسب فصل", color: "#20B2AA" },
    { name: "featured", title: "محصول منتخب", color: "#FF8C00" },
    // { name: "fast-selling", title: "", color: "#DC143C" }
  ];

  for (const label of labels) {
    // اگر لیبل وجود ندارد، ایجاد شود
    const existing = await prisma.label.findUnique({
      where: { name: label.name }
    });

    if (!existing) {
      await prisma.label.create({ data: label });
      console.log(`Label created: ${label.title}`);
    } else {
      console.log(`Label already exists: ${label.title}`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
