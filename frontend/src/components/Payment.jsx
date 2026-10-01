import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import axios from "axios";

const API_URL = "http://localhost:5000";

function Payment({
  orderId,
  amount,
  productName = "Jewellery",
}) {
  const { emptyCart } = useCart();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentId, setPaymentId] = useState("");
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  // Load Razorpay Checkout script
  useEffect(() => {
    const scriptUrl =
      "https://checkout.razorpay.com/v1/checkout.js";

    // Already loaded
    if (window.Razorpay) {
      setRazorpayLoaded(true);
      return;
    }

    // Script already exists but may still be loading
    const existingScript = document.querySelector(
      `script[src="${scriptUrl}"]`
    );

    if (existingScript) {
      const handleLoad = () => {
        setRazorpayLoaded(true);
      };

      const handleError = () => {
        setMessage("Unable to load Razorpay Checkout.");
      };

      existingScript.addEventListener("load", handleLoad);
      existingScript.addEventListener("error", handleError);

      return () => {
        existingScript.removeEventListener("load", handleLoad);
        existingScript.removeEventListener("error", handleError);
      };
    }

    const script = document.createElement("script");

    script.src = scriptUrl;
    script.async = true;

    script.onload = () => {
      setRazorpayLoaded(true);
    };

    script.onerror = () => {
      setMessage(
        "Unable to load Razorpay Checkout. Please check your internet connection."
      );
    };

    document.body.appendChild(script);

    return () => {
      script.onload = null;
      script.onerror = null;
    };
  }, []);

  const handlePayment = async () => {
    try {
      setLoading(true);
      setMessage("");
      setPaymentSuccess(false);
      setPaymentId("");

      const token = localStorage.getItem("token");

      if (!token) {
        setMessage("Please login first.");
        return;
      }

      if (!orderId) {
        setMessage(
          "Order ID is missing. Please create the order first."
        );
        return;
      }

      // IMPORTANT:
      // We do NOT send `amount` to the backend.
      // The backend gets the trusted amount from MongoDB.

      // Check Razorpay script
      if (!window.Razorpay) {
        setMessage(
          "Razorpay Checkout is still loading. Please wait a moment and try again."
        );
        return;
      }

      // 1. Create Razorpay order
      // Only orderId is sent.
      const response = await axios.post(
        `${API_URL}/api/payment/razorpay/order`,
        {
          orderId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const razorpayOrder = response.data.order;

      if (!razorpayOrder?.id) {
        setMessage(
          "Failed to create Razorpay payment order."
        );
        return;
      }

      // Amount returned here is created by the backend
      // from MongoDB order.totalAmount.
      const razorpayAmount = razorpayOrder.amount;

      // Convert paise to rupees for display only.
      const displayAmount = razorpayAmount / 100;

      // 2. Razorpay Checkout options
      const options = {
        key: "rzp_test_Tii4irEtHTFkZ1",

        // This amount comes from Razorpay/backend.
        amount: razorpayAmount,

        currency:
          razorpayOrder.currency || "INR",

        name: "Jewellery Shop",

        description: productName,

        order_id: razorpayOrder.id,

        handler: async function (paymentResponse) {
          try {
            setLoading(true);
            setMessage(
              "Payment received. Verifying..."
            );

            // 3. Verify payment on backend
            const verifyResponse =
              await axios.post(
                `${API_URL}/api/payment/razorpay/verify`,
                {
                  razorpay_order_id:
                    paymentResponse.razorpay_order_id,

                  razorpay_payment_id:
                    paymentResponse.razorpay_payment_id,

                  razorpay_signature:
                    paymentResponse.razorpay_signature,

                  orderId,
                },
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

            setPaymentId(
              verifyResponse.data.paymentId ||
                paymentResponse.razorpay_payment_id
            );

            // Clear cart ONLY after payment
            // has been successfully verified.
            await emptyCart();

            setPaymentSuccess(true);

            setMessage(
              "Payment verified successfully!"
            );
          } catch (error) {
            console.error(
              "Payment verification error:",
              error
            );

            setPaymentSuccess(false);

            setMessage(
              error.response?.data?.message ||
                "Payment verification failed"
            );
          } finally {
            setLoading(false);
          }
        },

        prefill: {
          name: "Vaishnavi",
          email: "vaishnavi@test.com",
        },

        theme: {
          color: "#b08d57",
        },

        modal: {
          ondismiss: function () {
            setMessage(
              "Payment window was closed."
            );
            setLoading(false);
          },
        },
      };

      const razorpay =
        new window.Razorpay(options);

      razorpay.on(
        "payment.failed",
        function (response) {
          console.error(
            "Payment failed:",
            response.error
          );

          setPaymentSuccess(false);

          setMessage(
            response.error?.description ||
              "Payment failed"
          );

          setLoading(false);
        }
      );

      razorpay.open();

      // Prevent unused variable warning.
      console.log(
        "Razorpay amount:",
        displayAmount
      );
    } catch (error) {
      console.error(
        "Razorpay error:",
        error
      );

      setMessage(
        error.response?.data?.message ||
          "Failed to start payment"
      );
    } finally {
      setLoading(false);
    }
  };

  // Payment successful UI
  if (paymentSuccess) {
    return (
      <div className="rounded-3xl border border-green-200 bg-green-50 p-7">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-xl text-green-700">
            ✓
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-green-600">
              Payment Complete
            </p>

            <h2 className="mt-1 font-serif text-3xl text-stone-900">
              Payment Successful
            </h2>
          </div>
        </div>

        <div className="mt-7 space-y-4 rounded-2xl bg-white p-5">
          <div className="flex justify-between gap-4">
            <span className="text-sm text-stone-500">
              Order ID
            </span>

            <span className="max-w-[250px] break-all text-right text-sm font-medium text-stone-800">
              {orderId}
            </span>
          </div>

          <div className="flex justify-between gap-4">
            <span className="text-sm text-stone-500">
              Payment ID
            </span>

            <span className="max-w-[250px] break-all text-right text-sm font-medium text-stone-800">
              {paymentId}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-sm text-stone-500">
              Amount Paid
            </span>

            <span className="font-serif text-xl text-stone-900">
              ₹
              {Number(amount).toLocaleString(
                "en-IN"
              )}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-sm text-stone-500">
              Payment Status
            </span>

            <span className="font-medium text-green-600">
              PAID
            </span>
          </div>
        </div>

        <p className="mt-5 text-sm text-green-700">
          Your payment has been successfully verified.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-stone-200 bg-[#fdfbf7] p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-[#b08d57]">
            Secure Payment
          </p>

          <h2 className="mt-2 font-serif text-2xl text-stone-900">
            {productName}
          </h2>
        </div>

        <div className="text-right">
          <p className="text-xs text-stone-500">
            Amount
          </p>

          <p className="font-serif text-2xl text-stone-900">
            ₹
            {Number(amount).toLocaleString(
              "en-IN"
            )}
          </p>
        </div>
      </div>

      {/* Pay Now Button */}
      <button
        type="button"
        onClick={handlePayment}
        disabled={
          loading || !razorpayLoaded
        }
        className="mt-7 flex w-full items-center justify-center gap-3 rounded-full bg-stone-900 px-8 py-4 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#b08d57] hover:shadow-xl disabled:cursor-not-allowed disabled:bg-stone-400 disabled:hover:translate-y-0"
      >
        {loading ? (
          <>
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Processing...
          </>
        ) : !razorpayLoaded ? (
          "Loading Payment..."
        ) : (
          <>
            🔒 Pay ₹
            {Number(amount).toLocaleString(
              "en-IN"
            )}
          </>
        )}
      </button>

      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-stone-500">
        <span>🔒</span>

        <span>
          Secure payment powered by Razorpay
        </span>
      </div>

      {message && (
        <div
          className={`mt-5 rounded-2xl border px-4 py-3 text-sm ${
            message
              .toLowerCase()
              .includes("success")
              ? "border-green-200 bg-green-50 text-green-700"
              : message
                  .toLowerCase()
                  .includes("closed")
              ? "border-yellow-200 bg-yellow-50 text-yellow-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
}

export default Payment;