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

import contentRoutes from "./src/modules/admin/content/contentRoutes.js";

import dashboardOverViewRoutes from "./src/modules/admin/dashboard/OverviewTab/OverviewTabRoutes.js";



dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(requestLogger);
swaggerDocs(app);


// 🔑 Auth routes
app.use("/api/auth", authRoutes);

app.use("/api/admin/categories", adminCategoryRoutes);
app.use("/api/admin/orders", adminOrderRoutes);
app.use("/api/admin/content", contentRoutes);
app.use("/api/admin/dashboard/overView", dashboardOverViewRoutes);
app.use("/api/admin/dashboard/summary", adminSummary);

app.use("/api/admin/users", adminUserRoutes);

app.use("/api/admin/products", adminProductRoutes);


export default app;
