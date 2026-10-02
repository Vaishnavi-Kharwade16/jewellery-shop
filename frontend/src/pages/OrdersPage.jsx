import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloadingInvoice, setDownloadingInvoice] =
    useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        if (!token) {
          setError("Please login first.");
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

        setOrders(
          Array.isArray(response.data)
            ? response.data
            : response.data.orders || []
        );
      } catch (err) {
        console.error("Fetch orders error:", err);

        setError(
          err.response?.data?.message ||
            "Failed to load orders"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // --------------------------------------------------
  // DOWNLOAD INVOICE
  // --------------------------------------------------

  const handleDownloadInvoice = async (orderId) => {
    try {
      setDownloadingInvoice(orderId);

      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please login first.");
        return;
      }

      const response = await axios.get(
        `${API_URL}/api/orders/${orderId}/invoice`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob",
        }
      );

      // Create a temporary URL for the PDF
      const blob = new Blob(
        [response.data],
        {
          type: "application/pdf",
        }
      );

      const url = window.URL.createObjectURL(blob);

      // Create temporary download link
      const link = document.createElement("a");

      link.href = url;
      link.download = `invoice-${orderId.slice(-8)}.pdf`;

      document.body.appendChild(link);
      link.click();

      // Cleanup
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(
        "Download invoice error:",
        err
      );

      // Blob responses can contain JSON error messages,
      // so try to extract them.
      if (
        err.response?.data instanceof Blob
      ) {
        try {
          const text =
            await err.response.data.text();

          const data = JSON.parse(text);

          alert(
            data.message ||
              "Failed to download invoice."
          );
        } catch {
          alert(
            "Failed to download invoice."
          );
        }
      } else {
        alert(
          err.response?.data?.message ||
            "Failed to download invoice."
        );
      }
    } finally {
      setDownloadingInvoice(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fdfbf7] px-6 py-20">
        <div className="mx-auto max-w-7xl">

          <div className="h-10 w-48 animate-pulse rounded bg-stone-200" />

          <div className="mt-12 space-y-6">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-56 animate-pulse rounded-3xl bg-stone-200"
              />
            ))}
          </div>

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
            YOUR COLLECTION
          </p>

          <h1 className="mt-3 font-serif text-5xl text-stone-900">
            My Orders
          </h1>

          <p className="mt-4 max-w-xl text-stone-600">
            View your jewellery purchases, payment details,
            invoices, and order history.
          </p>

        </div>
      </section>

      {/* Content */}
      <main className="mx-auto max-w-7xl px-6 py-12 lg:px-8">

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            {error}
          </div>
        )}

        {!error && orders.length === 0 && (
          <div className="mx-auto flex max-w-xl flex-col items-center py-20 text-center">

            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#f4eee3] text-4xl text-[#b08d57]">
              ♢
            </div>

            <p className="mt-8 text-xs tracking-[0.35em] text-[#b08d57]">
              ORDER HISTORY
            </p>

            <h2 className="mt-3 font-serif text-4xl text-stone-900">
              No Orders Yet
            </h2>

            <p className="mt-4 text-stone-500">
              Your jewellery purchases will appear here
              after you complete your first order.
            </p>

            <Link
              to="/products"
              className="mt-8 rounded-full bg-stone-900 px-8 py-3.5 text-sm font-medium text-white transition hover:bg-[#b08d57]"
            >
              Explore Jewellery
            </Link>

          </div>
        )}

        {!error && orders.length > 0 && (
          <div className="space-y-8">

            {orders.map((order) => (
              <div
                key={order._id}
                className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm transition hover:shadow-lg"
              >

                {/* Order Header */}
                <div className="border-b border-stone-200 bg-[#f4eee3] px-6 py-6 sm:px-8">

                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                    <div>
                      <p className="text-xs tracking-[0.25em] text-[#b08d57]">
                        ORDER
                      </p>

                      <h2 className="mt-2 break-all font-mono text-sm text-stone-800">
                        {order._id}
                      </h2>

                      <p className="mt-2 text-xs text-stone-500">
                        {order.createdAt
                          ? new Date(
                              order.createdAt
                            ).toLocaleString("en-IN")
                          : "Date unavailable"}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">

                      <span
                        className={`rounded-full px-4 py-1.5 text-xs font-medium ${
                          order.paymentStatus === "paid"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        Payment:{" "}
                        {order.paymentStatus || "pending"}
                      </span>

                      <span
                        className={`rounded-full px-4 py-1.5 text-xs font-medium ${
                          order.orderStatus === "placed"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-stone-200 text-stone-700"
                        }`}
                      >
                        {order.orderStatus || "pending"}
                      </span>

                    </div>

                  </div>

                </div>

                {/* Order Body */}
                <div className="p-6 sm:p-8">

                  <div className="grid gap-8 lg:grid-cols-[1fr_280px]">

                    {/* Items */}
                    <div>

                      <p className="text-xs font-medium tracking-[0.25em] text-[#b08d57]">
                        ITEMS
                      </p>

                      <div className="mt-5 space-y-4">

                        {order.items?.map((item, index) => {
                          const product =
                            item.product;

                          return (
                            <div
                              key={
                                item._id || index
                              }
                              className="flex items-center gap-4 rounded-2xl bg-[#fdfbf7] p-4"
                            >

                              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#f4eee3]">

                                {product?.images?.length >
                                0 ? (
                                  <img
                                    src={
                                      product.images[0]
                                    }
                                    alt={
                                      product.name ||
                                      "Jewellery"
                                    }
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <span className="text-2xl text-[#b08d57]">
                                    ✦
                                  </span>
                                )}

                              </div>

                              <div className="min-w-0 flex-1">

                                <h3 className="font-serif text-xl text-stone-900">
                                  {product?.name ||
                                    item.productName ||
                                    item.name ||
                                    "Jewellery Item"}
                                </h3>

                                <p className="mt-1 text-sm text-stone-500">
                                  Quantity:{" "}
                                  {item.quantity}
                                </p>

                                <p className="mt-1 text-sm text-stone-500">
                                  ₹
                                  {Number(
                                    item.price || 0
                                  ).toLocaleString(
                                    "en-IN"
                                  )}
                                </p>

                              </div>

                              <div className="text-right">
                                <p className="font-serif text-lg text-stone-900">
                                  ₹
                                  {(
                                    Number(
                                      item.price || 0
                                    ) *
                                    Number(
                                      item.quantity || 0
                                    )
                                  ).toLocaleString(
                                    "en-IN"
                                  )}
                                </p>
                              </div>

                            </div>
                          );
                        })}

                      </div>

                    </div>

                    {/* Summary */}
                    <aside className="rounded-2xl bg-stone-900 p-6 text-white">

                      <p className="text-xs tracking-[0.25em] text-[#d8b979]">
                        ORDER SUMMARY
                      </p>

                      <div className="mt-6 space-y-4">

                        <div className="flex justify-between text-sm text-stone-300">
                          <span>
                            Payment Method
                          </span>

                          <span className="font-medium text-white">
                            {order.paymentMethod ||
                              "RAZORPAY"}
                          </span>
                        </div>

                        <div className="flex justify-between text-sm text-stone-300">
                          <span>
                            Payment Status
                          </span>

                          <span
                            className={`font-medium ${
                              order.paymentStatus ===
                              "paid"
                                ? "text-green-400"
                                : "text-yellow-400"
                            }`}
                          >
                            {order.paymentStatus ||
                              "pending"}
                          </span>
                        </div>

                        <div className="flex justify-between text-sm text-stone-300">
                          <span>
                            Order Status
                          </span>

                          <span className="font-medium text-white">
                            {order.orderStatus ||
                              "placed"}
                          </span>
                        </div>

                      </div>

                      <div className="my-6 border-t border-stone-700" />

                      <div className="flex items-center justify-between">

                        <span className="text-stone-300">
                          Total
                        </span>

                        <span className="font-serif text-3xl text-[#d8b979]">
                          ₹
                          {Number(
                            order.totalAmount || 0
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </span>

                      </div>

                    </aside>

                  </div>

                  {/* Shipping */}
                  {order.shippingAddress && (
                    <div className="mt-8 border-t border-stone-200 pt-7">

                      <p className="text-xs font-medium tracking-[0.25em] text-[#b08d57]">
                        DELIVERY ADDRESS
                      </p>

                      <div className="mt-4 rounded-2xl bg-[#f4eee3] p-5 text-sm text-stone-600">

                        <p className="font-medium text-stone-900">
                          {
                            order.shippingAddress
                              .fullName
                          }
                        </p>

                        <p className="mt-1">
                          {
                            order.shippingAddress
                              .addressLine
                          }
                        </p>

                        <p>
                          {
                            order.shippingAddress
                              .city
                          }
                          ,{" "}
                          {
                            order.shippingAddress
                              .state
                          }{" "}
                          -{" "}
                          {
                            order.shippingAddress
                              .pincode
                          }
                        </p>

                        <p className="mt-2">
                          Phone:{" "}
                          {
                            order.shippingAddress
                              .phone
                          }
                        </p>

                      </div>

                    </div>
                  )}

                  {/* Invoice */}
                  <div className="mt-8 flex flex-col gap-3 border-t border-stone-200 pt-7 sm:flex-row sm:items-center sm:justify-between">

                    <div>
                      <p className="text-xs font-medium tracking-[0.25em] text-[#b08d57]">
                        INVOICE
                      </p>

                      <p className="mt-2 text-sm text-stone-500">
                        Download your detailed PDF invoice.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleDownloadInvoice(
                          order._id
                        )
                      }
                      disabled={
                        downloadingInvoice ===
                        order._id
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-stone-900 px-6 py-3 text-sm font-medium text-white transition-all duration-200 hover:bg-[#b08d57] disabled:cursor-not-allowed disabled:bg-stone-300"
                    >
                      {downloadingInvoice ===
                      order._id ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Generating Invoice...
                        </>
                      ) : (
                        <>
                          <span>↓</span>
                          Download Invoice
                        </>
                      )}
                    </button>

                  </div>

                </div>

              </div>
            ))}

          </div>
        )}

      </main>
    </div>
  );
}

export default OrdersPage;
