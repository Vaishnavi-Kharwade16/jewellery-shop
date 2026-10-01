import { useState } from "react";
import axios from "axios";

import { useCart } from "../context/CartContext";
import Payment from "./Payment";

const API_URL = "http://localhost:5000";

function Checkout() {
  const { cart, cartTotal, loading: cartLoading } = useCart();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [shippingAddress, setShippingAddress] = useState({
    fullName: "",
    phone: "",
    addressLine: "",
    city: "",
    state: "",
    pincode: "",
  });

  const handleChange = (e) => {
    setShippingAddress({
      ...shippingAddress,
      [e.target.name]: e.target.value,
    });
  };

  const createOrder = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setMessage("");

      const token = localStorage.getItem("token");

      if (!token) {
        setMessage("Please login first.");
        return;
      }

      const response = await axios.post(
        `${API_URL}/api/orders`,
        {
          shippingAddress,
          paymentMethod: "RAZORPAY",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setOrder(response.data.order);

      setMessage(
        "Order created. You can now proceed with payment."
      );
    } catch (error) {
      console.error("Create order error:", error);

      setMessage(
        error.response?.data?.message ||
          "Failed to create order"
      );
    } finally {
      setLoading(false);
    }
  };

  if (cartLoading) {
    return (
      <div className="payment-card">
        <p>Loading cart...</p>
      </div>
    );
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="payment-card">
        <h2>Checkout</h2>
        <p>Your cart is empty.</p>
      </div>
    );
  }

  return (
    <div className="payment-card">
      <h2>Checkout</h2>

      <p>
        Cart Total: ₹
        {cartTotal.toLocaleString("en-IN")}
      </p>

      {!order ? (
        <form onSubmit={createOrder}>
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={shippingAddress.fullName}
            onChange={handleChange}
            required
          />

          <input
            type="tel"
            name="phone"
            placeholder="Phone"
            value={shippingAddress.phone}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="addressLine"
            placeholder="Address"
            value={shippingAddress.addressLine}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="city"
            placeholder="City"
            value={shippingAddress.city}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="state"
            placeholder="State"
            value={shippingAddress.state}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="pincode"
            placeholder="Pincode"
            value={shippingAddress.pincode}
            onChange={handleChange}
            required
          />

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Creating Order..."
              : "Create Order"}
          </button>
        </form>
      ) : (
        <>
          <h3>Order Created</h3>

          <p>
            Order ID: {order._id}
          </p>

          <p>
            Amount: ₹
            {order.totalAmount.toLocaleString("en-IN")}
          </p>

          <Payment
            orderId={order._id}
            amount={order.totalAmount}
            productName="Jewellery Order"
          />
        </>
      )}

      {message && <p>{message}</p>}
    </div>
  );
}

export default Checkout;