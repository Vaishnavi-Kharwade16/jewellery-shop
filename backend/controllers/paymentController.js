const razorpay = require("../config/razorpay");
const crypto = require("crypto");
const Order = require("../models/Order");

// CREATE RAZORPAY ORDER
const createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        message: "Valid amount is required",
      });
    }

    const options = {
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    res.status(201).json({
      message: "Razorpay order created successfully",
      order: razorpayOrder,
    });
  } catch (error) {
    console.error("Razorpay order error:", error);

    res.status(500).json({
      message: "Failed to create Razorpay order",
    });
  }
};

// VERIFY RAZORPAY PAYMENT
const verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !orderId
    ) {
      return res.status(400).json({
        message: "Payment verification details are required",
      });
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(
        `${razorpay_order_id}|${razorpay_payment_id}`
      )
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        message: "Invalid payment signature",
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (order.user && order.user.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You cannot update this order",
      });
    }

    order.paymentMethod = "RAZORPAY";
    order.paymentStatus = "paid";
    order.paymentId = razorpay_payment_id;

    await order.save();

    res.json({
      message: "Payment verified successfully",
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      order,
    });
  } catch (error) {
    console.error("Payment verification error:", error);

    res.status(500).json({
      message: "Payment verification failed",
    });
  }
};
module.exports = {
  createRazorpayOrder,
  verifyRazorpayPayment,
};