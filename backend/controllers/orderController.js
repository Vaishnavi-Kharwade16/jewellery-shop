const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Coupon = require("../models/Coupon");
const Order = require("../models/Order");

const GST_RATE = 0.18;

// CREATE ORDER / CHECKOUT
const createOrder = async (req, res) => {
  try {
    const {
      shippingAddress,
      couponCode,
      paymentMethod = "COD",
    } = req.body;

    // 1. Validate address
    if (
      !shippingAddress ||
      !shippingAddress.fullName ||
      !shippingAddress.phone ||
      !shippingAddress.addressLine ||
      !shippingAddress.city ||
      !shippingAddress.state ||
      !shippingAddress.pincode
    ) {
      return res.status(400).json({
        message: "Complete shipping address is required",
      });
    }

    // 2. Validate payment method
    if (!["COD", "RAZORPAY", "STRIPE"].includes(paymentMethod)) {
      return res.status(400).json({
        message: "Invalid payment method",
      });
    }

    // 3. Get user's cart
    const cart = await Cart.findOne({
      user: req.user.id,
    }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        message: "Cart is empty",
      });
    }

    // 4. Validate products and stock
    for (const item of cart.items) {
      if (!item.product || !item.product.isActive) {
        return res.status(400).json({
          message: "One or more products are unavailable",
        });
      }

      if (item.quantity > item.product.stock) {
        return res.status(400).json({
          message: `Insufficient stock for ${item.product.name}`,
        });
      }
    }

    // 5. Calculate subtotal
    const subtotal = cart.items.reduce((total, item) => {
      return total + item.product.price * item.quantity;
    }, 0);

    // 6. Validate coupon
    let discount = 0;
    let appliedCoupon = null;

    if (couponCode) {
      const coupon = await Coupon.findOne({
        code: couponCode.toUpperCase().trim(),
        isActive: true,
      });

      if (!coupon) {
        return res.status(400).json({
          message: "Invalid coupon code",
        });
      }

      if (new Date() > coupon.expiryDate) {
        return res.status(400).json({
          message: "Coupon has expired",
        });
      }

      if (
        coupon.usageLimit !== null &&
        coupon.usedCount >= coupon.usageLimit
      ) {
        return res.status(400).json({
          message: "Coupon usage limit reached",
        });
      }

      if (subtotal < coupon.minOrderAmount) {
        return res.status(400).json({
          message: `Minimum order amount is ₹${coupon.minOrderAmount}`,
        });
      }

      if (coupon.discountType === "percentage") {
        discount = (subtotal * coupon.discountValue) / 100;

        if (
          coupon.maxDiscount !== null &&
          discount > coupon.maxDiscount
        ) {
          discount = coupon.maxDiscount;
        }
      } else {
        discount = coupon.discountValue;
      }

      if (discount > subtotal) {
        discount = subtotal;
      }

      appliedCoupon = coupon;
    }

    // 7. Calculate taxable amount
    const taxableAmount = subtotal - discount;

    // 8. Calculate GST
    const gst = taxableAmount * GST_RATE;

    // 9. Calculate final amount
    const totalAmount = taxableAmount + gst;

    // 10. Create order items
    const orderItems = cart.items.map((item) => ({
      product: item.product._id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      image:
        item.product.images && item.product.images.length > 0
          ? item.product.images[0]
          : "",
    }));

    // 11. Create order
    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      shippingAddress,
      subtotal,
      discount,
      gst,
      totalAmount,
      couponCode: appliedCoupon
        ? appliedCoupon.code
        : null,
      paymentMethod,
      paymentStatus:
        paymentMethod === "COD" ? "pending" : "pending",
      orderStatus: "placed",
      trackingHistory: [
        {
          status: "placed",
          date: new Date(),
        },
      ],
    });

    // 12. Reduce stock
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(
        item.product._id,
        {
          $inc: {
            stock: -item.quantity,
          },
        }
      );
    }

    // 13. Increase coupon usage
    if (appliedCoupon) {
      await Coupon.findByIdAndUpdate(
        appliedCoupon._id,
        {
          $inc: {
            usedCount: 1,
          },
        }
      );
    }

    // 14. Clear cart
    cart.items = [];
    await cart.save();

    res.status(201).json({
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    console.error("Create order error:", error);

    res.status(500).json({
      message: "Failed to create order",
    });
  }
};

// GET MY ORDERS
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user.id,
    }).sort({
      createdAt: -1,
    });

    res.json(orders);
  } catch (error) {
    console.error("Get orders error:", error);

    res.status(500).json({
      message: "Failed to fetch orders",
    });
  }
};

// GET SINGLE ORDER
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.json(order);
  } catch (error) {
    console.error("Get order error:", error);

    res.status(500).json({
      message: "Failed to fetch order",
    });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
};