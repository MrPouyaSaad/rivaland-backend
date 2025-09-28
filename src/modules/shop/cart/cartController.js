import * as cartService from "./cartService.js";

export async function getCart(req, res) {
  try {
    const userId = req.user.id; // از middleware احراز هویت
    const result = await cartService.getCartItems(userId);
    res.json({ success: true, data: result.cartItems, totalQuantity: result.totalQuantity });
  } catch (error) {
    console.error("[CartController] Error in getCart:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function addItem(req, res) {
  try {
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    if (!productId) return res.status(400).json({ success: false, message: "شناسه محصول الزامی است" });

    const item = await cartService.addToCart(userId, Number(productId), Number(quantity) || 1);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    console.error("[CartController] Error in addItem:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function updateQuantity(req, res) {
  try {
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    if (!productId) return res.status(400).json({ success: false, message: "شناسه محصول الزامی است" });

    const updated = await cartService.updateCartItemQuantity(userId, Number(productId), Number(quantity));
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error("[CartController] Error in updateQuantity:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function removeItem(req, res) {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    await cartService.removeFromCart(userId, Number(productId));
    res.json({ success: true, message: "کالا از سبد خرید حذف شد" });
  } catch (error) {
    console.error("[CartController] Error in removeItem:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}
