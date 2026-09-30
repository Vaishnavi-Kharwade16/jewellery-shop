const express = require("express");

const {
  updateOrderStatus,
  getAllOrders,
} = require("../controllers/adminOrderController");

const {
  authenticate,
  requireAdmin,
} = require("../middleware/auth");

const router = express.Router();

// GET /api/admin/orders
router.get("/", authenticate, requireAdmin, getAllOrders);

// PUT /api/admin/orders/:id/status
router.put(
  "/:id/status",
  authenticate,
  requireAdmin,
  updateOrderStatus
);

module.exports = router;