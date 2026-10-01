import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import Payment from "../components/Payment";

const API_URL = "http://localhost:5000";

const GST_RATE = 0.18;

function CheckoutPage() {
  const {
    cart,
    cartTotal,
    loading: cartLoading,
  } = useCart();

  const { isAuthenticated } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [shippingAddress, setShippingAddress] =
    useState({
      fullName: "",
      phone: "",
      addressLine: "",
      city: "",
      state: "",
      pincode: "",
    });

  const handleChange = (e) => {
    setShippingAddress((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));
  };

  const createOrder = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      setMessage(
        "Please login or register before completing your order."
      );
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const token = localStorage.getItem("token");

      if (!token) {
        setMessage(
          "Please login or register before checkout."
        );
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
        "Order created successfully. You can now complete your payment."
      );
    } catch (error) {
      console.error(
        "Create order error:",
        error
      );

      setMessage(
        error.response?.data?.message ||
          "Failed to create order"
      );
    } finally {
      setLoading(false);
    }
  };

  const subtotal = Number(cartTotal) || 0;

  const gst = subtotal * GST_RATE;

  const estimatedTotal =
    subtotal + gst;

  if (cartLoading) {
    return (
      <div className="min-h-screen bg-[#fdfbf7] px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto h-10 w-56 animate-pulse rounded bg-stone-200" />

          <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_380px]">
            <div className="h-[500px] animate-pulse rounded-3xl bg-stone-200" />

            <div className="h-[350px] animate-pulse rounded-3xl bg-stone-200" />
          </div>
        </div>
      </div>
    );
  }

  if (!cart?.items || cart.items.length === 0) {
    return (
      <div className="min-h-[75vh] bg-[#fdfbf7] px-6 py-20">
        <div className="mx-auto flex max-w-xl flex-col items-center text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#f4eee3] text-4xl text-[#b08d57]">
            ♢
          </div>

          <p className="mt-8 text-xs font-medium tracking-[0.35em] text-[#b08d57]">
            CHECKOUT
          </p>

          <h1 className="mt-3 font-serif text-5xl text-stone-900">
            Your Cart is Empty
          </h1>

          <p className="mt-5 text-stone-500">
            Add something beautiful to your cart
            before proceeding to checkout.
          </p>

          <Link
            to="/products"
            className="mt-8 rounded-full bg-stone-900 px-8 py-3.5 text-sm font-medium text-white transition hover:bg-[#b08d57]"
          >
            Explore Jewellery
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfbf7]">
      {/* Header */}
      <section className="border-b border-stone-200 bg-[#f4eee3]">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <p className="text-xs font-medium tracking-[0.4em] text-[#b08d57]">
            SECURE CHECKOUT
          </p>

          <h1 className="mt-3 font-serif text-5xl text-stone-900">
            Complete Your Order
          </h1>

          <p className="mt-4 max-w-xl text-stone-600">
            Enter your delivery details and
            complete your payment securely.
          </p>
        </div>
      </section>

      {/* Main */}
      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* Left */}
          <div className="space-y-8">
            {!isAuthenticated ? (
              <div className="rounded-3xl border border-stone-200 bg-white p-7 shadow-sm sm:p-9">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#f4eee3] text-xl text-[#b08d57]">
                    ♡
                  </div>

                  <div>
                    <p className="text-xs tracking-[0.25em] text-[#b08d57]">
                      CHECKOUT
                    </p>

                    <h2 className="mt-2 font-serif text-3xl text-stone-900">
                      Sign in to continue
                    </h2>

                    <p className="mt-3 max-w-lg text-sm leading-6 text-stone-500">
                      Your jewellery is safely saved in
                      your guest cart. Login or create
                      an account to continue with
                      shipping and secure payment.
                    </p>
                  </div>
                </div>

                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  <Link
                    to="/login"
                    className="rounded-full border border-stone-300 px-6 py-3.5 text-center text-sm font-medium text-stone-800 transition hover:border-[#b08d57] hover:text-[#b08d57]"
                  >
                    Login
                  </Link>

                  <Link
                    to="/register"
                    className="rounded-full bg-stone-900 px-6 py-3.5 text-center text-sm font-medium text-white transition hover:bg-[#b08d57]"
                  >
                    Create Account
                  </Link>
                </div>
              </div>
            ) : !order ? (
              <div className="rounded-3xl border border-stone-200 bg-white p-7 shadow-sm sm:p-9">
                <div className="mb-8">
                  <p className="text-xs tracking-[0.25em] text-[#b08d57]">
                    STEP 01
                  </p>

                  <h2 className="mt-2 font-serif text-3xl text-stone-900">
                    Shipping Information
                  </h2>

                  <p className="mt-2 text-sm text-stone-500">
                    Where should we deliver your jewellery?
                  </p>
                </div>

                <form
                  onSubmit={createOrder}
                  className="space-y-5"
                >
                  <div>
                    <label className="mb-2 block text-sm font-medium text-stone-700">
                      Full Name
                    </label>

                    <input
                      type="text"
                      name="fullName"
                      placeholder="Enter your full name"
                      value={shippingAddress.fullName}
                      onChange={handleChange}
                      required
                      className="w-full rounded-2xl border border-stone-200 bg-[#fdfbf7] px-4 py-3.5 text-sm outline-none transition placeholder:text-stone-400 focus:border-[#b08d57] focus:ring-2 focus:ring-[#b08d57]/10"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-stone-700">
                      Phone Number
                    </label>

                    <input
                      type="tel"
                      name="phone"
                      placeholder="Enter your phone number"
                      value={shippingAddress.phone}
                      onChange={handleChange}
                      required
                      className="w-full rounded-2xl border border-stone-200 bg-[#fdfbf7] px-4 py-3.5 text-sm outline-none transition placeholder:text-stone-400 focus:border-[#b08d57] focus:ring-2 focus:ring-[#b08d57]/10"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-stone-700">
                      Address
                    </label>

                    <textarea
                      name="addressLine"
                      placeholder="House number, street, area..."
                      value={shippingAddress.addressLine}
                      onChange={handleChange}
                      required
                      rows="3"
                      className="w-full resize-none rounded-2xl border border-stone-200 bg-[#fdfbf7] px-4 py-3.5 text-sm outline-none transition placeholder:text-stone-400 focus:border-[#b08d57] focus:ring-2 focus:ring-[#b08d57]/10"
                    />
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-stone-700">
                        City
                      </label>

                      <input
                        type="text"
                        name="city"
                        placeholder="City"
                        value={shippingAddress.city}
                        onChange={handleChange}
                        required
                        className="w-full rounded-2xl border border-stone-200 bg-[#fdfbf7] px-4 py-3.5 text-sm outline-none transition placeholder:text-stone-400 focus:border-[#b08d57] focus:ring-2 focus:ring-[#b08d57]/10"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-stone-700">
                        State
                      </label>

                      <input
                        type="text"
                        name="state"
                        placeholder="State"
                        value={shippingAddress.state}
                        onChange={handleChange}
                        required
                        className="w-full rounded-2xl border border-stone-200 bg-[#fdfbf7] px-4 py-3.5 text-sm outline-none transition placeholder:text-stone-400 focus:border-[#b08d57] focus:ring-2 focus:ring-[#b08d57]/10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-stone-700">
                      Pincode
                    </label>

                    <input
                      type="text"
                      name="pincode"
                      placeholder="6-digit pincode"
                      value={shippingAddress.pincode}
                      onChange={handleChange}
                      required
                      className="w-full rounded-2xl border border-stone-200 bg-[#fdfbf7] px-4 py-3.5 text-sm outline-none transition placeholder:text-stone-400 focus:border-[#b08d57] focus:ring-2 focus:ring-[#b08d57]/10"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-3 w-full rounded-full bg-stone-900 px-6 py-4 text-sm font-medium text-white transition hover:bg-[#b08d57] disabled:cursor-not-allowed disabled:bg-stone-400"
                  >
                    {loading
                      ? "Creating Your Order..."
                      : "Continue to Payment"}
                  </button>
                </form>
              </div>
            ) : (
              <div className="rounded-3xl border border-stone-200 bg-white p-7 shadow-sm sm:p-9">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700">
                    ✓
                  </div>

                  <div>
                    <p className="text-xs tracking-[0.25em] text-[#b08d57]">
                      STEP 02
                    </p>

                    <h2 className="mt-1 font-serif text-3xl text-stone-900">
                      Order Created
                    </h2>

                    <p className="mt-2 text-sm text-stone-500">
                      Your order is ready for secure payment.
                    </p>
                  </div>
                </div>

                <div className="mt-8 rounded-2xl bg-[#f4eee3] p-5">
                  <div className="flex justify-between gap-4">
                    <span className="text-sm text-stone-500">
                      Order ID
                    </span>

                    <span className="max-w-[220px] break-all text-right text-sm font-medium text-stone-800">
                      {order._id}
                    </span>
                  </div>

                  <div className="mt-4 flex justify-between">
                    <span className="text-sm text-stone-500">
                      Subtotal
                    </span>

                    <span className="text-sm font-medium text-stone-800">
                      ₹
                      {Number(
                        order.subtotal
                      ).toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="mt-4 flex justify-between">
                    <span className="text-sm text-stone-500">
                      GST (18%)
                    </span>

                    <span className="text-sm font-medium text-stone-800">
                      ₹
                      {Number(
                        order.gst
                      ).toLocaleString("en-IN")}
                    </span>
                  </div>

                  {Number(order.discount) > 0 && (
                    <div className="mt-4 flex justify-between">
                      <span className="text-sm text-stone-500">
                        Discount
                      </span>

                      <span className="text-sm font-medium text-green-600">
                        -₹
                        {Number(
                          order.discount
                        ).toLocaleString("en-IN")}
                      </span>
                    </div>
                  )}

                  <div className="my-5 border-t border-stone-200" />

                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-stone-700">
                      Total
                    </span>

                    <span className="font-serif text-2xl text-stone-900">
                      ₹
                      {Number(
                        order.totalAmount
                      ).toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="mt-4 flex justify-between">
                    <span className="text-sm text-stone-500">
                      Payment Method
                    </span>

                    <span className="text-sm font-medium text-stone-800">
                      Razorpay
                    </span>
                  </div>
                </div>

                <div className="mt-8">
                  <Payment
                    orderId={order._id}
                    amount={order.totalAmount}
                    productName="Jewellery Order"
                  />
                </div>
              </div>
            )}

            {message && (
              <div
                className={`rounded-2xl border p-4 text-sm ${
                  message
                    .toLowerCase()
                    .includes("failed")
                    ? "border-red-200 bg-red-50 text-red-700"
                    : "border-green-200 bg-green-50 text-green-700"
                }`}
              >
                {message}
              </div>
            )}
          </div>

          {/* Right: Summary */}
          <aside className="h-fit rounded-3xl bg-stone-900 p-7 text-white shadow-xl lg:sticky lg:top-24">
            <p className="text-xs tracking-[0.3em] text-[#d8b979]">
              ORDER SUMMARY
            </p>

            <h2 className="mt-3 font-serif text-3xl">
              Your Selection
            </h2>

            <div className="my-7 border-t border-stone-700" />

            <div className="space-y-5">
              {cart.items.map((item) => {
                if (!item.product) return null;

                return (
                  <div
                    key={item.product._id}
                    className="flex gap-4"
                  >
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#f4eee3]">
                      {item.product.images?.length > 0 ? (
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[#b08d57]">
                          ✦
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-serif text-lg">
                        {item.product.name}
                      </p>

                      <p className="mt-1 text-xs text-stone-400">
                        Quantity: {item.quantity}
                      </p>
                    </div>

                    <p className="text-sm text-stone-300">
                      ₹
                      {(
                        Number(item.product.price) *
                        item.quantity
                      ).toLocaleString("en-IN")}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="my-7 border-t border-stone-700" />

            <div className="flex justify-between text-sm text-stone-300">
              <span>Subtotal</span>

              <span>
                ₹
                {subtotal.toLocaleString(
                  "en-IN"
                )}
              </span>
            </div>

            <div className="mt-4 flex justify-between text-sm text-stone-300">
              <span>GST (18%)</span>

              <span>
                ₹
                {gst.toLocaleString(
                  "en-IN",
                  {
                    maximumFractionDigits: 2,
                  }
                )}
              </span>
            </div>

            <div className="mt-4 flex justify-between text-sm text-stone-300">
              <span>Delivery</span>

              <span className="text-[#d8b979]">
                Free
              </span>
            </div>

            <div className="my-7 border-t border-stone-700" />

            <div className="flex items-center justify-between">
              <span className="text-stone-300">
                Total
              </span>

              <span className="font-serif text-3xl text-[#d8b979]">
                ₹
                {estimatedTotal.toLocaleString(
                  "en-IN",
                  {
                    maximumFractionDigits: 2,
                  }
                )}
              </span>
            </div>

            <p className="mt-3 text-xs leading-5 text-stone-500">
              Includes 18% GST. The final amount shown
              here will be used for payment.
            </p>

            <div className="mt-6 rounded-2xl border border-stone-700 p-4">
              <p className="text-xs font-medium text-stone-300">
                🔒 Secure Payment
              </p>

              <p className="mt-1 text-xs leading-5 text-stone-500">
                Your payment is securely processed through
                Razorpay.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}

export default CheckoutPage;