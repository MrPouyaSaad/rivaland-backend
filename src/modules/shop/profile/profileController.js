import * as profileService from "./profileService.js";

// ----------------------------
// 📌 GET /api/user/profile
// ----------------------------
export async function getProfileHandler(req, res) {
  try {
    const userId = req.user.id; // فرض بر این است که middleware احراز هویت userId را در req.user قرار داده
    const user = await profileService.getProfile(userId);
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
}

// ----------------------------
// 📌 PUT /api/user/profile
// ----------------------------
export async function updateProfileHandler(req, res) {
  try {
    const userId = req.user.id;
    const data = req.body;

    const updatedUser = await profileService.updateProfile(userId, data);
    res.json({ success: true, message: "اطلاعات با موفقیت به‌روزرسانی شد" });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
}

// ----------------------------
// 📌 GET /api/user/orders
// ----------------------------
export async function getOrdersHandler(req, res) {
  try {
    const userId = req.user.id;
    const status = req.query.status; // optional: active, cancelled, delivered ...
    const orders = await profileService.getOrders(userId, status);
    res.json({ success: true, data: { orders, pagination: { page: 1, totalPages: 1, totalOrders: orders.length } } });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
}

// ----------------------------
// 📌 POST /api/user/orders/:orderId/cancel
// ----------------------------
export async function cancelOrderHandler(req, res) {
  try {
    const userId = req.user.id;
    const orderId = parseInt(req.params.orderId);

    const result = await profileService.cancelOrder(userId, orderId);
    res.json({ success: true, message: result.message });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
}

// ----------------------------
// 📌 GET /api/user/orders/stats
// ----------------------------
export async function getOrderStatsHandler(req, res) {
  try {
    const userId = req.user.id;
    const stats = await profileService.getOrderStats(userId);
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
}
