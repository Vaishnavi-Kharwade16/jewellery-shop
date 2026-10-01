const express = require("express");

const {
  createOrder,
  getMyOrders,
  getOrderById,
  downloadInvoice,
  getAdminOrderStats,
} = require("../controllers/orderController");

const {
  authenticate,
  requireAdmin,
} = require("../middleware/auth");

const router = express.Router();

// POST /api/orders
router.post(
  "/",
  authenticate,
  createOrder
);

// GET /api/orders/my
router.get(
  "/my",
  authenticate,
  getMyOrders
);

// ADMIN ORDER STATISTICS
// GET /api/orders/admin/stats
router.get(
  "/admin/stats",
  authenticate,
  requireAdmin,
  getAdminOrderStats
);

// GET /api/orders/:id/invoice
router.get(
  "/:id/invoice",
  authenticate,
  downloadInvoice
);

// GET /api/orders/:id
router.get(
  "/:id",
  authenticate,
  getOrderById
);

module.exports = router;