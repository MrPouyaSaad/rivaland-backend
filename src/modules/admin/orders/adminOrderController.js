import * as orderService from "./adminOrderService.js";
import PDFDocument from "pdfkit";
import { MessageService } from "../../../common/messaging/messageService.js";

// لیست
export async function listOrders(req, res) {
  try {
    const { page, limit, status, search } = req.query;
    const data = await orderService.getAllOrders({
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      status,
      search,
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "خطا در دریافت سفارش‌ها", error: err.message });
  }
}

// جزئیات
export async function getOrder(req, res) {
  try {
    const order = await orderService.getOrderById(req.params.id);
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "خطا در دریافت سفارش", error: err.message });
  }
}


export async function changeStatus(req, res) {
  try {
    const { status, trackingCode } = req.body;
    const updated = await orderService.updateOrderStatus(req.params.id, status, trackingCode);

    // 🚀 پیام به مشتری
    await MessageService.sendOrderStatusUpdate(updated.user, updated.id, status, trackingCode);

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "خطا در تغییر وضعیت سفارش", error: err.message });
  }
}


// ثبت پرداخت
export async function updatePayment(req, res) {
  try {
    const { method, status } = req.body;
    const updated = await orderService.updatePayment(req.params.id, { method, status });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "خطا در بروزرسانی پرداخت", error: err.message });
  }
}

// چاپ فاکتور (PDF)
export async function printInvoice(req, res) {
  try {
    const order = await orderService.getOrderById(req.params.id);

    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename=invoice-${order.id}.pdf`);

    doc.text(`فاکتور سفارش #${order.id}`, { align: "center" });
    doc.moveDown();
    doc.text(`مشتری: ${order.user.username} (${order.user.email})`);
    doc.text(`تاریخ: ${order.createdAt}`);
    doc.text(`مبلغ کل: ${order.total}`);
    doc.text(`وضعیت: ${order.status}`);
    doc.moveDown();

    doc.text("لیست محصولات:");
    order.items.forEach(item => {
      doc.text(`- ${item.product.name} × ${item.quantity} = ${item.price}`);
    });

    doc.end();
    doc.pipe(res);
  } catch (err) {
    res.status(500).json({ message: "خطا در چاپ فاکتور", error: err.message });
  }
}

export async function deleteOrder(req, res) {
  try {
    await orderService.deleteOrder(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: "خطا در حذف سفارش", error: err.message });
  }
}

