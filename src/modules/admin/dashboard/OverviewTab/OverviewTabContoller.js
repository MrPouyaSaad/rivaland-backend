import * as overviewService from "./OverviewTabService.js";

export const getOverview = async (req, res) => {
  try {
    const stats = await overviewService.getOverviewStats();
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("❌ خطا در کنترلر نمای کلی:", error);
    res.status(500).json({
      success: false,
      message: "خطایی در دریافت داده‌های نمای کلی رخ داده است.",
      details: error.message,
    });
  }
};
