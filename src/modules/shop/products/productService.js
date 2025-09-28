import prisma from "../../../../prisma/prisma.js";


export async function getAllProducts({ page = 1, limit = 10 }) {
  try {
    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);

    console.log("[ProductService] Fetching all products");

    const [total, products] = await Promise.all([
      prisma.product.count({ where: { isActive: true } }),
      prisma.product.findMany({
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
        skip: (pageNumber - 1) * pageSize,
        take: pageSize,
        include: {
          images: true,
          labels: { include: { label: true } },
          category: true,
        },
      }),
    ]);

    return {
      products,
      pagination: {
        total,
        page: pageNumber,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  } catch (error) {
    console.error("[ProductService] Error fetching all products:", error);
    throw new Error("خطا در دریافت محصولات");
  }
}

export async function getProductsByCategory(categoryId, { page = 1, limit = 10 }) {
  try {
    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);

    console.log(`[ProductService] Fetching products by category: ${categoryId}`);

    const [total, products] = await Promise.all([
      prisma.product.count({ where: { categoryId: Number(categoryId), isActive: true } }),
      prisma.product.findMany({
        where: { categoryId: Number(categoryId), isActive: true },
        orderBy: { createdAt: "desc" },
        skip: (pageNumber - 1) * pageSize,
        take: pageSize,
        include: {
          images: true,
          labels: { include: { label: true } },
          category: true,
        },
      }),
    ]);

    return {
      products,
      pagination: {
        total,
        page: pageNumber,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  } catch (error) {
    console.error("[ProductService] Error fetching products by category:", error);
    throw new Error("خطا در دریافت محصولات دسته‌بندی");
  }
}

export async function getProductsByLabel(labelName, { page = 1, limit = 10 }) {
  try {
    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);

    console.log(`[ProductService] Fetching products by label: ${labelName}`);

    const [total, products] = await Promise.all([
      prisma.product.count({
        where: {
          isActive: true,
          labels: { some: { label: { name: labelName } } },
        },
      }),
      prisma.product.findMany({
        where: {
          isActive: true,
          labels: { some: { label: { name: labelName } } },
        },
        orderBy: { createdAt: "desc" },
        skip: (pageNumber - 1) * pageSize,
        take: pageSize,
        include: {
          images: true,
          labels: { include: { label: true } },
          category: true,
        },
      }),
    ]);

    return {
      products,
      pagination: {
        total,
        page: pageNumber,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  } catch (error) {
    console.error("[ProductService] Error fetching products by label:", error);
    throw new Error("خطا در دریافت محصولات با لیبل");
  }
}

export async function getProductById(id) {
  try {
    console.log(`[ProductService] Fetching product by ID: ${id}`);

    const product = await prisma.product.findUnique({
      where: { id: Number(id) },
      include: {
        images: true,
        labels: { include: { label: true } },
        category: true,
        attributes: true,
      },
    });

    if (!product) {
      throw new Error("محصول یافت نشد");
    }

    return product;
  } catch (error) {
    console.error("[ProductService] Error fetching product by ID:", error);
    throw error;
  }
}

export async function searchProductsByName(search, { page = 1, limit = 10 }) {
  try {
    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);

    console.log(`[ProductService] Searching products by name: ${search}`);

    const [total, products] = await Promise.all([
      prisma.product.count({
        where: {
          isActive: true,
          name: { contains: search, mode: "insensitive" },
        },
      }),
      prisma.product.findMany({
        where: {
          isActive: true,
          name: { contains: search, mode: "insensitive" },
        },
        orderBy: { createdAt: "desc" },
        skip: (pageNumber - 1) * pageSize,
        take: pageSize,
        include: {
          images: true,
          labels: { include: { label: true } },
          category: true,
        },
      }),
    ]);

    return {
      products,
      pagination: {
        total,
        page: pageNumber,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  } catch (error) {
    console.error("[ProductService] Error searching products:", error);
    throw new Error("خطا در جستجوی محصولات");
  }
}
