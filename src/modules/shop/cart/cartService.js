import prisma from "../../../../prisma/prisma.js";


export async function getCartItems(userId) {
  try {
    console.log(`[CartService] Fetching cart for user: ${userId}`);

    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            images: true,
            labels: { include: { label: true } },
          },
        },
      },
    });

    const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    return { cartItems, totalQuantity };
  } catch (error) {
    console.error("[CartService] Error fetching cart items:", error);
    throw new Error("خطا در دریافت سبد خرید");
  }
}

export async function addToCart(userId, productId, quantity = 1) {
  try {
    console.log(`[CartService] Adding product ${productId} to user ${userId}'s cart`);

    const existing = await prisma.cartItem.findUnique({
      where: { userId_productId: { userId, productId } },
    });

    if (existing) {
      return prisma.cartItem.update({
        where: { userId_productId: { userId, productId } },
        data: { quantity: existing.quantity + quantity },
      });
    }

    return prisma.cartItem.create({
      data: { userId, productId, quantity },
    });
  } catch (error) {
    console.error("[CartService] Error adding to cart:", error);
    throw new Error("خطا در افزودن به سبد خرید");
  }
}

export async function updateCartItemQuantity(userId, productId, quantity) {
  try {
    console.log(`[CartService] Updating product ${productId} quantity to ${quantity} for user ${userId}`);

    if (quantity <= 0) {
      await prisma.cartItem.delete({
        where: { userId_productId: { userId, productId } },
      });
      return null;
    }

    return prisma.cartItem.update({
      where: { userId_productId: { userId, productId } },
      data: { quantity },
    });
  } catch (error) {
    console.error("[CartService] Error updating cart quantity:", error);
    throw new Error("خطا در بروزرسانی تعداد کالا");
  }
}

export async function removeFromCart(userId, productId) {
  try {
    console.log(`[CartService] Removing product ${productId} from user ${userId}'s cart`);

    return prisma.cartItem.delete({
      where: { userId_productId: { userId, productId } },
    });
  } catch (error) {
    console.error("[CartService] Error removing from cart:", error);
    throw new Error("خطا در حذف کالا از سبد خرید");
  }
}
