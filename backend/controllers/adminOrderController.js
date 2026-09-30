const Order = require("../models/Order");

// UPDATE ORDER STATUS
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "placed",
      "packed",
      "shipped",
      "delivered",
      "cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid order status",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    order.orderStatus = status;

    order.trackingHistory.push({
      status,
      date: new Date(),
    });

    await order.save();

    res.json({
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    console.error("Update order status error:", error);

    res.status(500).json({
      message: "Failed to update order status",
    });
  }
};

// GET ALL ORDERS FOR ADMIN
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json({
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Get all orders error:", error);

    res.status(500).json({
      message: "Failed to fetch orders",
    });
  }
};

module.exports = {
  updateOrderStatus,
  getAllOrders,
};