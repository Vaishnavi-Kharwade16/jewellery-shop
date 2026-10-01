const express = require("express");

const {
  getProducts,
  getProductById,
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const {
  authenticate,
  requireAdmin,
} = require("../middleware/auth");

const router = express.Router();

// Public product catalog
router.get("/", getProducts);

// Admin product management
// IMPORTANT: This must come before /:id
router.get(
  "/admin",
  authenticate,
  requireAdmin,
  getAdminProducts
);

// Public product details
router.get("/:id", getProductById);

// Admin create product
router.post(
  "/",
  authenticate,
  requireAdmin,
  createProduct
);

// Admin update product
router.put(
  "/:id",
  authenticate,
  requireAdmin,
  updateProduct
);

// Admin delete/deactivate product
router.delete(
  "/:id",
  authenticate,
  requireAdmin,
  deleteProduct
);

module.exports = router;