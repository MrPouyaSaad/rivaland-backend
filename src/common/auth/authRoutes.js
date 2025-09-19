import express from "express";
import { loginController,verifyLoginCodeController,requestLoginCodeController } from "./authController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: مدیریت ورود و احراز هویت
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: ورود (ادمین یا کاربر)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: admin
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: ورود موفق و دریافت توکن
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 token:
 *                   type: string
 *                 role:
 *                   type: string
 *                   example: admin
 *       401:
 *         description: نام کاربری یا رمز اشتباه
 */
router.post("/login", loginController);
// ورود با شماره و کد تایید
router.post("/request-code", requestLoginCodeController);
router.post("/verify-code", verifyLoginCodeController);

export default router;
