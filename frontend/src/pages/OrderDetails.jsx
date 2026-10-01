import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const API_URL = "http://localhost:5000";

function OrderDetails() {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token =
          localStorage.getItem("token");

        const response = await axios.get(
          `${API_URL}/api/orders/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setOrder(response.data);
      } catch (error) {
        console.error(
          "Fetch order error:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="page-container">
        <p>Loading order...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="page-container">
        <h1>Order not found</h1>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-heading">
        <p>ORDER DETAILS</p>

        <h1>
          Order #{order._id.slice(-8)}
        </h1>
      </div>

      <div className="order-details-card">
        <p>
          <strong>Payment:</strong>{" "}
          {order.paymentStatus}
        </p>

        <p>
          <strong>Order Status:</strong>{" "}
          {order.orderStatus}
        </p>

        <p>
          <strong>Payment Method:</strong>{" "}
          {order.paymentMethod}
        </p>

        <p>
          <strong>Total:</strong> ₹
          {Number(
            order.totalAmount
          ).toLocaleString("en-IN")}
        </p>

        <hr />

        <h2>Items</h2>

        {order.items.map((item, index) => (
          <div
            className="order-item"
            key={index}
          >
            <span>
              {item.name} × {item.quantity}
            </span>

            <span>
              ₹
              {Number(
                item.price
              ).toLocaleString("en-IN")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default OrderDetails;