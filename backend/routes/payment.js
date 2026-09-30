const express = require("express");

const {
  createRazorpayOrder,
  verifyRazorpayPayment,
} = require("../controllers/paymentController");

const {
  authenticate,
} = require("../middleware/auth");

const router = express.Router();

// Create Razorpay order
router.post(
  "/razorpay/order",
  authenticate,
  createRazorpayOrder
);

// Verify Razorpay payment
router.post(
  "/razorpay/verify",
  authenticate,
  verifyRazorpayPayment
);

module.exports = router;