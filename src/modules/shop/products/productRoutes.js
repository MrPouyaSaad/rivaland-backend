import express from "express";
import * as productController from "./productController.js";

const router = express.Router();

/**
 * @swagger
 * /products/all:
 *   get:
 *     summary: Get all products
 *     tags:
 *       - Products
 */
router.get("/all", productController.getAllProducts);

/**
 * @swagger
 * /products/category:
 *   get:
 *     summary: Get products by category
 *     tags:
 *       - Products
 *     parameters:
 *       - in: query
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 */
router.get("/category", productController.getProductsByCategory);

/**
 * @swagger
 * /products/label:
 *   get:
 *     summary: Get products by label
 *     tags:
 *       - Products
 *     parameters:
 *       - in: query
 *         name: label
 *         required: true
 *         schema:
 *           type: string
 */
router.get("/label", productController.getProductsByLabel);

/**
 * @swagger
 * /products/search:
 *   get:
 *     summary: Search products by name
 *     tags:
 *       - Products
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 */
router.get("/search", productController.searchProducts);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
router.get("/:id", productController.getProductById);

export default router;
