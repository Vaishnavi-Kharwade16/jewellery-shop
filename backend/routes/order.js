const express = require("express");

const {
  createOrder,
  getMyOrders,
  getOrderById,
} = require("../controllers/orderController");

const { authenticate } = require("../middleware/auth");

const router = express.Router();

// POST /api/orders
router.post("/", authenticate, createOrder);

// GET /api/orders/my
router.get("/my", authenticate, getMyOrders);

// GET /api/orders/:id
router.get("/:id", authenticate, getOrderById);

module.exports = router;