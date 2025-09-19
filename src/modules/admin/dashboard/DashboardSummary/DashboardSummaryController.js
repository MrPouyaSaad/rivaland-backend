import * as dashboardSummaryService from "./DashboardSummaryService.js";

export const getSummary = async (req, res) => {
  try {
    const stats = await dashboardSummaryService.getDashboardSummary();
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("❌ خطا در کنترلر آمار کلی داشبورد:", error);
    res.status(500).json({
      success: false,
      message: "خطایی در دریافت آمار کلی رخ داده است.",
      details: error.message,
    });
  }
};
