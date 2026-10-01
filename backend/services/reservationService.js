const Order = require("../models/Order");
const Product = require("../models/Product");

const releaseExpiredReservations = async () => {
  try {
    const expiredOrders = await Order.find({
      paymentMethod: "RAZORPAY",
      paymentStatus: "pending",
      stockReserved: true,
      reservationExpiresAt: { $lte: new Date() },
    });

    if (expiredOrders.length === 0) {
      return;
    }

    console.log(`Found ${expiredOrders.length} expired reservation(s).`);

    for (const order of expiredOrders) {
      const releasedItems = [];

      try {
        // Release reserved stock for every product.
        for (const item of order.items) {
          const updatedProduct = await Product.findOneAndUpdate(
            {
              _id: item.product,
              reservedStock: { $gte: item.quantity },
            },
            {
              $inc: {
                reservedStock: -item.quantity,
              },
            },
            {
              new: true,
            }
          );

          if (!updatedProduct) {
            throw new Error(
              `Unable to release reserved stock for ${item.name}`
            );
          }

          releasedItems.push({
            productId: item.product,
            quantity: item.quantity,
          });
        }

        // Only cancel the order after ALL reservations
        // have been successfully released.
        order.stockReserved = false;
        order.reservationExpiresAt = null;
        order.paymentStatus = "failed";
        order.orderStatus = "cancelled";

        order.trackingHistory.push({
          status: "cancelled",
          date: new Date(),
        });

        await order.save();

        console.log(
          `Released expired reservation for order ${order._id}`
        );
      } catch (orderError) {
        console.error(
          `Failed to release reservation for order ${order._id}:`,
          orderError
        );

        // Roll back any reservations released before the failure.
        if (releasedItems.length > 0) {
          for (const item of releasedItems) {
            try {
              await Product.findByIdAndUpdate(item.productId, {
                $inc: {
                  reservedStock: item.quantity,
                },
              });
            } catch (rollbackError) {
              console.error(
                `Reservation rollback failed for product ${item.productId}:`,
                rollbackError
              );
            }
          }
        }
      }
    }
  } catch (error) {
    console.error("Expired reservation cleanup error:", error);
  }
};

const startReservationCleanup = () => {
  // Run once immediately when the server starts.
  releaseExpiredReservations();

  // Then check every minute.
  setInterval(releaseExpiredReservations, 60 * 1000);

  console.log("Reservation cleanup service started.");
};

module.exports = {
  releaseExpiredReservations,
  startReservationCleanup,
};