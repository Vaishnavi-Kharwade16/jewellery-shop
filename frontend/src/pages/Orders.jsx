import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token =
          localStorage.getItem("token");

        const response = await axios.get(
          `${API_URL}/api/orders/my`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setOrders(response.data);
      } catch (error) {
        console.error(
          "Fetch orders error:",
          error
        );

        setError(
          error.response?.data?.message ||
            "Failed to fetch orders"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="page-container">
        <p>Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-heading">
        <p>YOUR PURCHASES</p>

        <h1>My Orders</h1>

        <span>
          View your jewellery purchases and payment status.
        </span>
      </div>

      {error && (
        <p className="error-message">
          {error}
        </p>
      )}

      {!error && orders.length === 0 && (
        <div className="empty-state">
          <h2>No orders yet</h2>

          <p>
            Your completed orders will appear here.
          </p>
        </div>
      )}

      <div className="orders-grid">
        {orders.map((order) => (
          <div
            className="order-card"
            key={order._id}
          >
            <div className="order-header">
              <div>
                <span>ORDER</span>

                <h3>
                  #{order._id.slice(-8)}
                </h3>
              </div>

              <span
                className={`status ${
                  order.paymentStatus
                }`}
              >
                {order.paymentStatus}
              </span>
            </div>

            <div className="order-info">
              <p>
                <span>Date</span>

                {new Date(
                  order.createdAt
                ).toLocaleDateString("en-IN")}
              </p>

              <p>
                <span>Payment</span>

                {order.paymentMethod}
              </p>

              <p>
                <span>Total</span>

                ₹
                {Number(
                  order.totalAmount
                ).toLocaleString("en-IN")}
              </p>
            </div>

            <div className="order-items">
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
        ))}
      </div>
    </div>
  );
}

export default Orders;