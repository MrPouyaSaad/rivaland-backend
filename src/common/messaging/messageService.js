// src/common/messaging/messageService.js
import { logMessage } from "./messageLogger.js";

export class MessageService {
  // پیام ساده (پیش‌فرض: لاگ)
  static async sendMessage({ to, content, type = "system" }) {
    // 🚀 اینجا بعداً می‌تونه وصل بشه به سرویس SMS / Email
    logMessage({ type, to, content });
    return { success: true, to, content, type };
  }

  // پیام تغییر وضعیت سفارش
  static async sendOrderStatusUpdate(user, orderId, status, trackingCode) {
    const message = `سفارش #${orderId} شما به وضعیت «${status}» تغییر یافت. ${
      status === "shipped" && trackingCode ? `کد رهگیری: ${trackingCode}` : ""
    }`;

    return await this.sendMessage({
      to: user.email || user.username,
      content: message,
      type: "order-status",
    });
  }

  // پیام پرداخت
  static async sendPaymentUpdate(user, orderId, status, method) {
    const message = `پرداخت سفارش #${orderId} با روش ${method} در وضعیت «${status}» قرار گرفت.`;

    return await this.sendMessage({
      to: user.email || user.username,
      content: message,
      type: "payment",
    });
  }
}
