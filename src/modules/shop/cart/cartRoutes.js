import express from "express";
import * as cartController from "./cartController.js";
import { auth } from "../../../common/auth/authMiddleware.js";

const router = express.Router();
router.use(auth("user"));
/**
 * @swagger
 * /cart:
 *   get:
 *     summary: Get user's cart
 *     tags: [Cart]
 *     responses:
 *       200:
 *         description: List of cart items with total quantity
 */
router.get("/", cartController.getCart);

/**
 * @swagger
 * /cart:
 *   post:
 *     summary: Add item to cart
 *     tags: [Cart]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: integer
 *               quantity:
 *                 type: integer
 *                 default: 1
 */
router.post("/", cartController.addItem);

/**
 * @swagger
 * /cart:
 *   put:
 *     summary: Update item quantity
 *     tags: [Cart]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: integer
 *               quantity:
 *                 type: integer
 */
router.put("/", cartController.updateQuantity);

/**
 * @swagger
 * /cart/{productId}:
 *   delete:
 *     summary: Remove item from cart
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: productId
 *         schema:
 *           type: integer
 *         required: true
 */
router.delete("/:productId", cartController.removeItem);

export default router;
