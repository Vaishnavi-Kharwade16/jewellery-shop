const razorpay = require("../config/razorpay");
const crypto = require("crypto");

const Order = require("../models/Order");
const Product = require("../models/Product");
const Cart = require("../models/Cart");
const Coupon = require("../models/Coupon");

// --------------------------------------------------
// CREATE RAZORPAY ORDER
// --------------------------------------------------

const createRazorpayOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    // 1. Validate order ID
    if (!orderId) {
      return res.status(400).json({
        message: "Order ID is required",
      });
    }

    // 2. Find user's order
    const order = await Order.findOne({
      _id: orderId,
      user: req.user.id,
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    // 3. Only Razorpay orders
    if (order.paymentMethod !== "RAZORPAY") {
      return res.status(400).json({
        message:
          "This order is not configured for Razorpay payment",
      });
    }

    // 4. Don't pay twice
    if (order.paymentStatus === "paid") {
      return res.status(400).json({
        message: "This order has already been paid",
      });
    }

    // 5. Make sure stock is reserved
    if (!order.stockReserved) {
      return res.status(400).json({
        message: "Stock reservation is missing for this order",
      });
    }

    // 6. Make sure reservation has not expired
    if (
      !order.reservationExpiresAt ||
      new Date() > order.reservationExpiresAt
    ) {
      return res.status(400).json({
        message:
          "This payment session has expired. Please create a new order.",
      });
    }

    // 7. Validate amount
    if (!order.totalAmount || order.totalAmount <= 0) {
      return res.status(400).json({
        message: "Invalid order amount",
      });
    }

    // --------------------------------------------------
    // 8. REUSE EXISTING RAZORPAY ORDER
    // --------------------------------------------------

    /*
      If a Razorpay order has already been created for
      this database order, return the existing one.

      This prevents duplicate Razorpay orders when the
      user clicks the Pay button multiple times.
    */

    if (order.razorpayOrderId) {
      return res.status(200).json({
        message: "Existing Razorpay order returned",
        order: {
          id: order.razorpayOrderId,
          amount: Math.round(order.totalAmount * 100),
          currency: "INR",
        },
      });
    }

    // --------------------------------------------------
    // 9. CREATE NEW RAZORPAY ORDER
    // --------------------------------------------------

    /*
      Amount always comes from MongoDB.

      Never trust the amount sent by the frontend.
    */

    const amountInPaise = Math.round(
      order.totalAmount * 100
    );

    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `receipt_${order._id}`,
    };

    const razorpayOrder =
      await razorpay.orders.create(options);

    // --------------------------------------------------
    // 10. SAVE RAZORPAY ORDER ID
    // --------------------------------------------------

    order.razorpayOrderId = razorpayOrder.id;

    await order.save();

    // --------------------------------------------------
    // 11. SUCCESS RESPONSE
    // --------------------------------------------------

    res.status(201).json({
      message:
        "Razorpay order created successfully",
      order: razorpayOrder,
    });
  } catch (error) {
    console.error(
      "Razorpay order error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to create Razorpay order",
    });
  }
};

// --------------------------------------------------
// VERIFY RAZORPAY PAYMENT
// --------------------------------------------------

const verifyRazorpayPayment = async (req, res) => {
  const finalizedStock = [];

  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = req.body;

    // --------------------------------------------------
    // 1. Validate required fields
    // --------------------------------------------------

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !orderId
    ) {
      return res.status(400).json({
        message:
          "Payment verification details are required",
      });
    }

    // --------------------------------------------------
    // 2. Find user's order
    // --------------------------------------------------

    const order = await Order.findOne({
      _id: orderId,
      user: req.user.id,
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    // --------------------------------------------------
    // 3. Verify Razorpay order ID
    // --------------------------------------------------

    if (
      !order.razorpayOrderId ||
      order.razorpayOrderId !== razorpay_order_id
    ) {
      return res.status(400).json({
        message:
          "Razorpay order does not match this order",
      });
    }

    // --------------------------------------------------
    // 4. Prevent duplicate payment
    // --------------------------------------------------

    if (order.paymentStatus === "paid") {
      return res.status(400).json({
        message:
          "This order has already been paid",
      });
    }

    // --------------------------------------------------
    // 5. Make sure stock is reserved
    // --------------------------------------------------

    if (!order.stockReserved) {
      return res.status(400).json({
        message:
          "Stock reservation is missing for this order",
      });
    }

    // --------------------------------------------------
    // 6. Make sure reservation has not expired
    // --------------------------------------------------

    if (
      !order.reservationExpiresAt ||
      new Date() > order.reservationExpiresAt
    ) {
      return res.status(400).json({
        message:
          "This payment session has expired. Please create a new order.",
      });
    }

    // --------------------------------------------------
    // 7. Verify Razorpay signature
    // --------------------------------------------------

    const generatedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET
      )
      .update(
        `${razorpay_order_id}|${razorpay_payment_id}`
      )
      .digest("hex");

    if (
      generatedSignature !== razorpay_signature
    ) {
      return res.status(400).json({
        message:
          "Invalid payment signature",
      });
    }

    /*
      PAYMENT IS NOW VERIFIED.

      The stock was already reserved when the
      order was created.

      We now convert:

        stock:          available physical stock
        reservedStock:  temporary reservation

      into:

        stock:          stock - quantity
        reservedStock:  reservedStock - quantity
    */

    // --------------------------------------------------
    // 8. Finalize reserved stock
    // --------------------------------------------------

    for (const item of order.items) {
      const updatedProduct =
        await Product.findOneAndUpdate(
          {
            _id: item.product,
            isActive: true,

            // Quantity must still be reserved.
            reservedStock: {
              $gte: item.quantity,
            },

            // Physical stock must still exist.
            stock: {
              $gte: item.quantity,
            },
          },
          {
            $inc: {
              stock: -item.quantity,
              reservedStock: -item.quantity,
            },
          },
          {
            new: true,
          }
        );

      if (!updatedProduct) {
        throw new Error(
          `Unable to finalize reserved stock for ${item.name}`
        );
      }

      finalizedStock.push({
        productId: item.product,
        quantity: item.quantity,
      });
    }

    // --------------------------------------------------
    // 9. Increase coupon usage safely
    // --------------------------------------------------

    if (order.couponCode) {
      const coupon = await Coupon.findOne({
        code: order.couponCode,
        isActive: true,
      });

      if (!coupon) {
        throw new Error(
          "Coupon used for this order is no longer available"
        );
      }

      // Check usage limit again.
      if (
        coupon.usageLimit !== null &&
        coupon.usedCount >= coupon.usageLimit
      ) {
        throw new Error(
          "Coupon usage limit has been reached"
        );
      }

      const couponQuery = {
        _id: coupon._id,
        isActive: true,
      };

      if (coupon.usageLimit !== null) {
        couponQuery.$expr = {
          $lt: [
            "$usedCount",
            "$usageLimit",
          ],
        };
      }

      const updatedCoupon =
        await Coupon.findOneAndUpdate(
          couponQuery,
          {
            $inc: {
              usedCount: 1,
            },
          },
          {
            new: true,
          }
        );

      if (!updatedCoupon) {
        throw new Error(
          "Coupon could not be finalized"
        );
      }
    }

    // --------------------------------------------------
    // 10. Remove purchased items from cart
    // --------------------------------------------------

    const cart = await Cart.findOne({
      user: req.user.id,
    });

    if (cart) {
      for (const orderItem of order.items) {
        const cartItem = cart.items.find(
          (item) =>
            item.product.toString() ===
            orderItem.product.toString()
        );

        if (cartItem) {
          cartItem.quantity -=
            orderItem.quantity;

          if (cartItem.quantity <= 0) {
            cart.items = cart.items.filter(
              (item) =>
                item.product.toString() !==
                orderItem.product.toString()
            );
          }
        }
      }

      await cart.save();
    }

    // --------------------------------------------------
    // 11. Mark order as paid
    // --------------------------------------------------

    order.paymentMethod = "RAZORPAY";
    order.paymentStatus = "paid";
    order.paymentId = razorpay_payment_id;

    order.stockReserved = false;
    order.reservationExpiresAt = null;

    await order.save();

    // --------------------------------------------------
    // 12. Successful response
    // --------------------------------------------------

    res.json({
      message:
        "Payment verified successfully",
      paymentId:
        razorpay_payment_id,
      orderId: order._id,
      order,
    });
  } catch (error) {
    console.error(
      "Payment verification error:",
      error
    );

    // --------------------------------------------------
    // STOCK ROLLBACK
    // --------------------------------------------------

    /*
      If stock was finalized but something later
      failed, restore the stock reservation.

      Example:

        stock:          5 → 4
        reservedStock:  1 → 0

      Rollback:

        stock:          4 → 5
        reservedStock:  0 → 1
    */

    if (finalizedStock.length > 0) {
      for (const item of finalizedStock) {
        try {
          await Product.findByIdAndUpdate(
            item.productId,
            {
              $inc: {
                stock: item.quantity,
                reservedStock: item.quantity,
              },
            }
          );
        } catch (rollbackError) {
          console.error(
            "Stock rollback error:",
            rollbackError
          );
        }
      }
    }

    // --------------------------------------------------
    // KNOWN ERRORS
    // --------------------------------------------------

    const knownErrorMessages = [
      "Unable to finalize reserved stock",
      "Coupon used for this order is no longer available",
      "Coupon usage limit has been reached",
      "Coupon could not be finalized",
    ];

    const isKnownError =
      knownErrorMessages.some(
        (message) =>
          error.message?.startsWith(message)
      );

    res.status(isKnownError ? 400 : 500).json({
      message: isKnownError
        ? error.message
        : "Payment verification failed",
    });
  }
};

// --------------------------------------------------
// EXPORT CONTROLLERS
// --------------------------------------------------

module.exports = {
  createRazorpayOrder,
  verifyRazorpayPayment,
};