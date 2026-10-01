const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Coupon = require("../models/Coupon");
const Order = require("../models/Order");

const PDFDocument = require("pdfkit");

const GST_RATE = 0.18;

// Pending online orders reserve stock for 15 minutes.
const RESERVATION_MINUTES = 15;

const createOrder = async (req, res) => {
  const reservedItems = [];

  try {
    const {
      shippingAddress,
      couponCode,
      paymentMethod = "COD",
    } = req.body;

    // --------------------------------------------------
    // 1. Validate shipping address
    // --------------------------------------------------

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

    // --------------------------------------------------
    // 2. Validate payment method
    // --------------------------------------------------

    if (!["COD", "RAZORPAY"].includes(paymentMethod)) {
      return res.status(400).json({
        message: "Invalid or unsupported payment method",
      });
    }

    // --------------------------------------------------
    // 3. Get user's cart
    // --------------------------------------------------

    const cart = await Cart.findOne({
      user: req.user.id,
    }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        message: "Cart is empty",
      });
    }

    // --------------------------------------------------
    // 4. Validate products
    // --------------------------------------------------

    for (const item of cart.items) {
      if (!item.product || !item.product.isActive) {
        return res.status(400).json({
          message: "One or more products are unavailable",
        });
      }

      if (item.quantity < 1) {
        return res.status(400).json({
          message: "Invalid product quantity",
        });
      }
    }

    // --------------------------------------------------
    // 5. Calculate subtotal
    // --------------------------------------------------

    const subtotal = cart.items.reduce((total, item) => {
      return total + item.product.price * item.quantity;
    }, 0);

    // --------------------------------------------------
    // 6. Apply coupon
    // --------------------------------------------------

    let discount = 0;
    let appliedCoupon = null;

    if (couponCode) {
      const normalizedCouponCode = couponCode
        .toUpperCase()
        .trim();

      const coupon = await Coupon.findOne({
        code: normalizedCouponCode,
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
        discount =
          (subtotal * coupon.discountValue) / 100;

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

    // --------------------------------------------------
    // 7. Calculate GST and final amount
    // --------------------------------------------------

    const taxableAmount = subtotal - discount;

    const gst = taxableAmount * GST_RATE;

    const totalAmount = taxableAmount + gst;

    // --------------------------------------------------
    // 8. Reserve stock
    // --------------------------------------------------

    if (paymentMethod === "RAZORPAY") {
      for (const item of cart.items) {
        const productId = item.product._id;
        const quantity = item.quantity;

        const reservedProduct =
          await Product.findOneAndUpdate(
            {
              _id: productId,
              isActive: true,

              $expr: {
                $gte: [
                  {
                    $subtract: [
                      "$stock",
                      {
                        $ifNull: [
                          "$reservedStock",
                          0,
                        ],
                      },
                    ],
                  },
                  quantity,
                ],
              },
            },
            {
              $inc: {
                reservedStock: quantity,
              },
            },
            {
              new: true,
            }
          );

        if (!reservedProduct) {
          throw new Error(
            `Insufficient available stock for ${item.product.name}`
          );
        }

        reservedItems.push({
          productId,
          quantity,
        });
      }
    }

    // --------------------------------------------------
    // 9. Create order items
    // --------------------------------------------------

    const orderItems = cart.items.map((item) => ({
      product: item.product._id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      image:
        item.product.images &&
        item.product.images.length > 0
          ? item.product.images[0]
          : "",
    }));

    // --------------------------------------------------
    // 10. Reservation expiry
    // --------------------------------------------------

    let reservationExpiresAt = null;

    if (paymentMethod === "RAZORPAY") {
      reservationExpiresAt = new Date(
        Date.now() +
          RESERVATION_MINUTES * 60 * 1000
      );
    }

    // --------------------------------------------------
    // 11. Create order
    // --------------------------------------------------

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

      paymentStatus: "pending",

      orderStatus: "placed",

      stockReserved:
        paymentMethod === "RAZORPAY",

      reservationExpiresAt,

      trackingHistory: [
        {
          status: "placed",
          date: new Date(),
        },
      ],
    });

    // --------------------------------------------------
    // 12. COD
    // --------------------------------------------------

    if (paymentMethod === "COD") {
      const finalizedProducts = [];

      try {
        for (const item of cart.items) {
          const finalizedProduct =
            await Product.findOneAndUpdate(
              {
                _id: item.product._id,
                isActive: true,

                $expr: {
                  $gte: [
                    {
                      $subtract: [
                        "$stock",
                        {
                          $ifNull: [
                            "$reservedStock",
                            0,
                          ],
                        },
                      ],
                    },
                    item.quantity,
                  ],
                },
              },
              {
                $inc: {
                  stock: -item.quantity,
                },
              },
              {
                new: true,
              }
            );

          if (!finalizedProduct) {
            throw new Error(
              `Insufficient stock for ${item.product.name}`
            );
          }

          finalizedProducts.push({
            productId: item.product._id,
            quantity: item.quantity,
          });
        }

        // Coupon is consumed only after COD stock
        // has successfully been finalized.
        if (appliedCoupon) {
          const updatedCoupon =
            await Coupon.findOneAndUpdate(
              {
                _id: appliedCoupon._id,
                isActive: true,

                ...(appliedCoupon.usageLimit !== null
                  ? {
                      $expr: {
                        $lt: [
                          "$usedCount",
                          "$usageLimit",
                        ],
                      },
                    }
                  : {}),
              },
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
              "Coupon is no longer available"
            );
          }
        }

        // Remove purchased products from cart.
        cart.items = [];
        await cart.save();

        order.paymentStatus = "pending";
        order.stockReserved = false;
        order.reservationExpiresAt = null;

        await order.save();
      } catch (codError) {
        // Roll back stock reductions already made.
        for (const item of finalizedProducts) {
          await Product.findByIdAndUpdate(
            item.productId,
            {
              $inc: {
                stock: item.quantity,
              },
            }
          );
        }

        throw codError;
      }
    }

    // --------------------------------------------------
    // 13. Response
    // --------------------------------------------------

    res.status(201).json({
      message:
        paymentMethod === "RAZORPAY"
          ? "Order created and stock reserved for payment"
          : "Order created successfully",

      order,
    });
  } catch (error) {
    console.error(
      "Create order error:",
      error
    );

    // --------------------------------------------------
    // 14. Roll back Razorpay stock reservations
    // --------------------------------------------------

    if (reservedItems.length > 0) {
      for (const item of reservedItems) {
        try {
          await Product.findByIdAndUpdate(
            item.productId,
            {
              $inc: {
                reservedStock: -item.quantity,
              },
            }
          );
        } catch (rollbackError) {
          console.error(
            "Stock reservation rollback error:",
            rollbackError
          );
        }
      }
    }

    const message =
      error.message &&
      error.message.startsWith(
        "Insufficient available stock"
      )
        ? error.message
        : error.message ===
          "Coupon is no longer available"
        ? error.message
        : "Failed to create order";

    res.status(400).json({
      message,
    });
  }
};

// --------------------------------------------------
// GET MY ORDERS
// --------------------------------------------------

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user.id,
    }).sort({
      createdAt: -1,
    });

    res.json(orders);
  } catch (error) {
    console.error(
      "Get orders error:",
      error
    );

    res.status(500).json({
      message: "Failed to fetch orders",
    });
  }
};

// --------------------------------------------------
// GET ORDER BY ID
// --------------------------------------------------

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
    console.error(
      "Get order error:",
      error
    );

    res.status(500).json({
      message: "Failed to fetch order",
    });
  }
};

// --------------------------------------------------
// DOWNLOAD INVOICE PDF
// --------------------------------------------------

const downloadInvoice = async (req, res) => {
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

    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
    });

    const invoiceNumber = `INV-${order._id
      .toString()
      .slice(-8)
      .toUpperCase()}`;

    const orderNumber = order._id
      .toString()
      .toUpperCase();

    const orderDate = new Date(
      order.createdAt
    ).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const formatCurrency = (amount) =>
      `Rs. ${Number(amount || 0).toLocaleString(
        "en-IN",
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }
      )}`;

    // --------------------------------------------------
    // PDF response headers
    // --------------------------------------------------

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${invoiceNumber}.pdf"`
    );

    // Pipe PDF directly to browser
    doc.pipe(res);

    // --------------------------------------------------
    // Header
    // --------------------------------------------------

    doc
      .fontSize(24)
      .font("Helvetica-Bold")
      .fillColor("#292524")
      .text("JEWELLERY", 50, 50);

    doc
      .fontSize(10)
      .font("Helvetica")
      .fillColor("#b08d57")
      .text("COLLECTION", 52, 78);

    doc
      .fontSize(22)
      .font("Helvetica-Bold")
      .fillColor("#292524")
      .text("INVOICE", 400, 50, {
        align: "right",
      });

    // Gold separator
    doc
      .moveTo(50, 105)
      .lineTo(545, 105)
      .strokeColor("#b08d57")
      .lineWidth(2)
      .stroke();

    // --------------------------------------------------
    // Invoice details
    // --------------------------------------------------

    doc
      .fontSize(10)
      .font("Helvetica")
      .fillColor("#57534e")
      .text(`Invoice No: ${invoiceNumber}`, 50, 125);

    doc
      .text(`Order No: ${orderNumber}`, 50, 142);

    doc
      .text(`Order Date: ${orderDate}`, 50, 159);

    doc
      .text(
        `Payment Method: ${order.paymentMethod}`,
        50,
        176
      );

    doc
      .text(
        `Payment Status: ${order.paymentStatus}`,
        50,
        193
      );

    // --------------------------------------------------
    // Customer / Shipping address
    // --------------------------------------------------

    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .fillColor("#292524")
      .text("Bill To / Ship To", 300, 125);

    const address = order.shippingAddress || {};

    doc
      .fontSize(10)
      .font("Helvetica")
      .fillColor("#57534e")
      .text(
        address.fullName || "",
        300,
        145
      );

    doc.text(
      address.phone
        ? `Phone: ${address.phone}`
        : "",
      300,
      161
    );

    doc.text(
      address.addressLine || "",
      300,
      177,
      {
        width: 245,
      }
    );

    doc.text(
      `${address.city || ""}, ${
        address.state || ""
      } - ${address.pincode || ""}`,
      300,
      207,
      {
        width: 245,
      }
    );

    // --------------------------------------------------
    // Items table
    // --------------------------------------------------

    const tableTop = 260;

    doc
      .rect(50, tableTop, 495, 28)
      .fill("#f4eee3");

    doc
      .fontSize(10)
      .font("Helvetica-Bold")
      .fillColor("#292524")
      .text("Item", 60, tableTop + 9);

    doc.text(
      "Qty",
      330,
      tableTop + 9,
      {
        width: 40,
        align: "center",
      }
    );

    doc.text(
      "Price",
      385,
      tableTop + 9,
      {
        width: 70,
        align: "right",
      }
    );

    doc.text(
      "Amount",
      465,
      tableTop + 9,
      {
        width: 70,
        align: "right",
      }
    );

    let currentY = tableTop + 28;

    order.items.forEach((item, index) => {
      const rowHeight = 42;

      if (index % 2 === 0) {
        doc
          .rect(
            50,
            currentY,
            495,
            rowHeight
          )
          .fill("#fdfbf7");
      }

      doc
        .fontSize(9)
        .font("Helvetica")
        .fillColor("#44403c")
        .text(
          item.name || "Jewellery Item",
          60,
          currentY + 14,
          {
            width: 250,
          }
        );

      doc.text(
        String(item.quantity),
        330,
        currentY + 14,
        {
          width: 40,
          align: "center",
        }
      );

      doc.text(
        formatCurrency(item.price),
        385,
        currentY + 14,
        {
          width: 70,
          align: "right",
        }
      );

      const itemTotal =
        Number(item.price || 0) *
        Number(item.quantity || 0);

      doc.text(
        formatCurrency(itemTotal),
        465,
        currentY + 14,
        {
          width: 70,
          align: "right",
        }
      );

      currentY += rowHeight;
    });

    // Table bottom line
    doc
      .moveTo(50, currentY)
      .lineTo(545, currentY)
      .strokeColor("#d6d3d1")
      .lineWidth(1)
      .stroke();

    // --------------------------------------------------
    // Price summary
    // --------------------------------------------------

    let summaryY = currentY + 25;

    doc
      .fontSize(10)
      .font("Helvetica")
      .fillColor("#57534e")
      .text(
        "Subtotal",
        350,
        summaryY
      );

    doc.text(
      formatCurrency(order.subtotal),
      455,
      summaryY,
      {
        width: 90,
        align: "right",
      }
    );

    summaryY += 20;

    if (Number(order.discount) > 0) {
      doc
        .text(
          "Discount",
          350,
          summaryY
        );

      doc
        .fillColor("#15803d")
        .text(
          `- ${formatCurrency(order.discount)}`,
          455,
          summaryY,
          {
            width: 90,
            align: "right",
          }
        );

      summaryY += 20;
    }

    doc
      .fillColor("#57534e")
      .text(
        "GST (18%)",
        350,
        summaryY
      );

    doc.text(
      formatCurrency(order.gst),
      455,
      summaryY,
      {
        width: 90,
        align: "right",
      }
    );

    summaryY += 30;

    // Total box
    doc
      .roundedRect(
        340,
        summaryY,
        205,
        45,
        6
      )
      .fill("#292524");

    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .fillColor("#ffffff")
      .text(
        "TOTAL",
        355,
        summaryY + 15
      );

    doc
      .text(
        formatCurrency(order.totalAmount),
        435,
        summaryY + 15,
        {
          width: 95,
          align: "right",
        }
      );

    // --------------------------------------------------
    // Footer
    // --------------------------------------------------

    const footerY = 730;

    doc
      .moveTo(50, footerY - 15)
      .lineTo(545, footerY - 15)
      .strokeColor("#d6d3d1")
      .lineWidth(1)
      .stroke();

    doc
      .fontSize(9)
      .font("Helvetica")
      .fillColor("#78716c")
      .text(
        "Thank you for shopping with Jewellery Collection.",
        50,
        footerY,
        {
          width: 495,
          align: "center",
        }
      );

    doc
      .fontSize(8)
      .text(
        "This is a computer-generated invoice.",
        50,
        footerY + 18,
        {
          width: 495,
          align: "center",
        }
      );

    // Finish PDF
    doc.end();
  } catch (error) {
    console.error(
      "Download invoice error:",
      error
    );

    if (!res.headersSent) {
      return res.status(500).json({
        message: "Failed to generate invoice",
      });
    }
  }
};
// --------------------------------------------------
// ADMIN ORDER STATISTICS
// --------------------------------------------------

// GET /api/orders/admin/stats
const getAdminOrderStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();

    const totalRevenueResult = await Order.aggregate([
      {
        $match: {
          orderStatus: {
            $ne: "cancelled",
          },
          paymentStatus: {
            $in: ["paid", "pending"],
          },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: "$totalAmount",
          },
        },
      },
    ]);

    const totalRevenue =
      totalRevenueResult.length > 0
        ? totalRevenueResult[0].totalRevenue
        : 0;

    const orderStatusResult = await Order.aggregate([
      {
        $group: {
          _id: "$orderStatus",
          count: {
            $sum: 1,
          },
        },
      },
    ]);

    const paymentStatusResult = await Order.aggregate([
      {
        $group: {
          _id: "$paymentStatus",
          count: {
            $sum: 1,
          },
        },
      },
    ]);

    const paymentMethodResult = await Order.aggregate([
      {
        $group: {
          _id: "$paymentMethod",
          count: {
            $sum: 1,
          },
        },
      },
    ]);

    const recentOrders = await Order.find()
      .populate("user", "name email")
      .sort({
        createdAt: -1,
      })
      .limit(10);

    res.json({
      totalOrders,
      totalRevenue,
      orderStatus: orderStatusResult,
      paymentStatus: paymentStatusResult,
      paymentMethod: paymentMethodResult,
      recentOrders,
    });
  } catch (error) {
    console.error(
      "Get admin order stats error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to fetch admin order statistics",
    });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  downloadInvoice,
  getAdminOrderStats,
};