import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setMessage("");

      const token = localStorage.getItem("token");

      if (!token) {
        setMessage("Please login first.");
        return;
      }

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
      console.error("Fetch orders error:", error);

      setMessage(
        error.response?.data?.message ||
          "Failed to fetch orders"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="payment-card">
        <h2>My Orders</h2>
        <p>Loading orders...</p>
      </div>
    );
  }

  if (message) {
    return (
      <div className="payment-card">
        <h2>My Orders</h2>
        <p>{message}</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="payment-card">
        <h2>My Orders</h2>
        <p>No orders found.</p>
      </div>
    );
  }

  return (
    <div>
      <h2>My Orders</h2>

      {orders.map((order) => (
        <div
          className="payment-card"
          key={order._id}
          style={{ marginBottom: "20px" }}
        >
          <h3>Order</h3>

          <p>
            <strong>Order ID:</strong>{" "}
            {order._id}
          </p>

          <p>
            <strong>Date:</strong>{" "}
            {new Date(
              order.createdAt
            ).toLocaleString("en-IN")}
          </p>

          <p>
            <strong>Total:</strong> ₹
            {Number(
              order.totalAmount
            ).toLocaleString("en-IN")}
          </p>

          <p>
            <strong>Payment Method:</strong>{" "}
            {order.paymentMethod}
          </p>

          <p>
            <strong>Payment Status:</strong>{" "}
            {order.paymentStatus}
          </p>

          <p>
            <strong>Order Status:</strong>{" "}
            {order.orderStatus}
          </p>

          <h4>Items</h4>

          {order.items?.map((item, index) => (
            <div key={index}>
              <p>
                {item.name} × {item.quantity}
              </p>

              <p>
                ₹
                {Number(
                  item.price
                ).toLocaleString("en-IN")}
              </p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default Orders;
