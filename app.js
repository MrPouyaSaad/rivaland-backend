import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { swaggerDocs } from "./src/config/swagger.js";
import authRoutes from "./src/common/auth/authRoutes.js";
import { auth } from "./src/common/auth/authMiddleware.js";
import adminProductRoutes from "./src/modules/admin/products/adminProductRoutes.js";
import { requestLogger } from './src/common/middleware/loggerMiddleware.js';
import adminCategoryRoutes from "./src/modules/admin/categories/adminCategoryRoutes.js";
import adminOrderRoutes from "./src/modules/admin/orders/adminOrderRoutes.js";
import adminSummary from "./src/modules/admin/dashboard/DashboardSummary/DashboardSummaryRoutes.js";
import adminUserRoutes from "./src/modules/admin/users/adminUserRoutes.js";
import adminLabelsRoutes from "./src/modules/admin/labels/labelsRoutes.js";
import productsBannerRoutes from "./src/modules/admin/content/product_banner/products_bannerRoutes.js";
import smallBannerRoutes from "./src/modules/admin/content/small_banner/small_bannerRoutes.js";
import sliderRoutes from "./src/modules/admin/content/slider/sliderRoutes.js";
import dashboardOverViewRoutes from "./src/modules/admin/dashboard/OverviewTab/OverviewTabRoutes.js";
import productsRoutes from "./src/modules/shop/products/productRoutes.js";
import categoryRoutes from "./src/modules/shop/categories/categoryRoutes.js";
import cartRoutes from "./src/modules/shop/cart/cartRoutes.js";
import contentRoutes from "./src/modules/shop/content/contentRoutes.js";


dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(requestLogger);
swaggerDocs(app);


// 🔑 Auth routes
app.use("/api/auth", authRoutes);

//? ADMIN
app.use("/api/admin/categories", adminCategoryRoutes);
app.use("/api/admin/labels", adminLabelsRoutes);
app.use("/api/admin/orders", adminOrderRoutes);
app.use("/api/admin/content/slider",sliderRoutes);
app.use("/api/admin/content/small-banner", smallBannerRoutes);
app.use("/api/admin/content/products-banner", productsBannerRoutes);
app.use("/api/admin/dashboard/overView", dashboardOverViewRoutes);
app.use("/api/admin/dashboard/summary", adminSummary);
app.use("/api/admin/users", adminUserRoutes);
app.use("/api/admin/products", adminProductRoutes);

//? USER
app.use("/api/products",productsRoutes);
app.use("/api/categories",categoryRoutes);
app.use("/api/cart",cartRoutes);
app.use("/api/content",contentRoutes);


export default app;
