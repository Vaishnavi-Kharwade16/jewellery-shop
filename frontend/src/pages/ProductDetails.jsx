import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";

import { useCart } from "../context/CartContext";
import ReviewSection from "../components/ReviewSection";

const API_URL = import.meta.env.VITE_API_URL;

function ProductDetails() {
  const { id } = useParams();

  const { addToCart, loading: cartLoading } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get(
          `${API_URL}/api/products/${id}`
        );

        setProduct(response.data);
      } catch (err) {
        console.error("Fetch product error:", err);

        setError(
          err.response?.data?.message ||
            "Failed to load product"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    try {
      await addToCart(product._id, 1);
    } catch (err) {
      console.error("Add to cart error:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fdfbf7] px-6 py-20">
        <div className="mx-auto max-w-7xl">

          <div className="grid gap-10 lg:grid-cols-2">

            <div className="h-[550px] animate-pulse rounded-3xl bg-stone-200" />

            <div className="space-y-5 py-10">
              <div className="h-4 w-32 animate-pulse rounded bg-stone-200" />
              <div className="h-12 w-80 animate-pulse rounded bg-stone-200" />
              <div className="h-6 w-40 animate-pulse rounded bg-stone-200" />
              <div className="h-24 w-full animate-pulse rounded bg-stone-200" />
            </div>

          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex min-h-[75vh] items-center justify-center bg-[#fdfbf7] px-6">

        <div className="text-center">

          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#f4eee3] text-3xl text-[#b08d57]">
            ✦
          </div>

          <h1 className="mt-6 font-serif text-4xl text-stone-900">
            Product Not Found
          </h1>

          <p className="mt-3 text-stone-500">
            {error || "This product is no longer available."}
          </p>

          <Link
            to="/products"
            className="mt-7 inline-block rounded-full bg-stone-900 px-7 py-3 text-sm font-medium text-white transition hover:bg-[#b08d57]"
          >
            Back to Products
          </Link>

        </div>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfbf7]">

      {/* Breadcrumb */}
      <div className="mx-auto max-w-7xl px-6 pt-8 lg:px-8">

        <Link
          to="/products"
          className="text-sm text-stone-500 transition hover:text-[#b08d57]"
        >
          ← Back to Jewellery
        </Link>

      </div>

      {/* Product */}
      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-16">

        <div className="grid gap-12 lg:grid-cols-2">

          {/* Image */}
          <div className="overflow-hidden rounded-[2rem] bg-[#f4eee3]">

            <div className="relative flex min-h-[500px] items-center justify-center">

              {product.images?.length > 0 ? (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="h-full max-h-[650px] w-full object-cover"
                />
              ) : (
                <div className="flex h-[500px] w-full items-center justify-center">
                  <span className="font-serif text-7xl text-[#b08d57]">
                    ✦
                  </span>
                </div>
              )}

              <div className="absolute left-5 top-5">

                {product.stock > 0 ? (
                  <span className="rounded-full bg-white/90 px-4 py-2 text-xs font-medium text-stone-700 shadow backdrop-blur">
                    In Stock
                  </span>
                ) : (
                  <span className="rounded-full bg-stone-900 px-4 py-2 text-xs font-medium text-white">
                    Sold Out
                  </span>
                )}

              </div>

            </div>

          </div>

          {/* Information */}
          <div className="flex flex-col justify-center">

            <p className="text-xs font-medium uppercase tracking-[0.35em] text-[#b08d57]">
              {product.metalType || "Fine Jewellery"}
            </p>

            <h1 className="mt-4 font-serif text-5xl leading-tight text-stone-900 sm:text-6xl">
              {product.name}
            </h1>

            <div className="mt-6">
              <p className="font-serif text-3xl text-stone-900">
                ₹
                {Number(product.price).toLocaleString(
                  "en-IN"
                )}
              </p>
            </div>

            {product.description && (
              <p className="mt-7 max-w-xl text-base leading-7 text-stone-600">
                {product.description}
              </p>
            )}

            {/* Details */}
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">

              {product.metalType && (
                <div className="rounded-2xl bg-[#f4eee3] p-4">
                  <p className="text-xs text-stone-500">
                    Metal
                  </p>

                  <p className="mt-1 font-medium text-stone-900">
                    {product.metalType}
                  </p>
                </div>
              )}

              {product.karat && (
                <div className="rounded-2xl bg-[#f4eee3] p-4">
                  <p className="text-xs text-stone-500">
                    Karat
                  </p>

                  <p className="mt-1 font-medium text-stone-900">
                    {product.karat}K
                  </p>
                </div>
              )}

              {product.weight !== undefined && (
                <div className="rounded-2xl bg-[#f4eee3] p-4">
                  <p className="text-xs text-stone-500">
                    Weight
                  </p>

                  <p className="mt-1 font-medium text-stone-900">
                    {product.weight}g
                  </p>
                </div>
              )}

              <div className="rounded-2xl bg-[#f4eee3] p-4">
                <p className="text-xs text-stone-500">
                  Stock
                </p>

                <p className="mt-1 font-medium text-stone-900">
                  {product.stock > 0
                    ? `${product.stock} available`
                    : "Sold Out"}
                </p>
              </div>

            </div>

            {/* Add to Cart */}
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={
                  cartLoading ||
                  product.stock <= 0
                }
                className="flex-1 rounded-full bg-stone-900 px-8 py-4 text-sm font-medium text-white transition duration-300 hover:bg-[#b08d57] disabled:cursor-not-allowed disabled:bg-stone-300"
              >
                {product.stock <= 0
                  ? "Out of Stock"
                  : cartLoading
                  ? "Adding..."
                  : "Add to Cart"}
              </button>

              <Link
                to="/cart"
                className="rounded-full border border-stone-300 px-8 py-4 text-center text-sm font-medium text-stone-800 transition hover:border-[#b08d57] hover:text-[#b08d57]"
              >
                View Cart
              </Link>

            </div>

            {/* Trust */}
            <div className="mt-10 border-t border-stone-200 pt-7">

              <div className="grid gap-5 sm:grid-cols-3">

                <div>
                  <p className="text-sm font-medium text-stone-900">
                    ✦ Premium Quality
                  </p>

                  <p className="mt-1 text-xs text-stone-500">
                    Carefully selected jewellery
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-stone-900">
                    ♢ Secure Payment
                  </p>

                  <p className="mt-1 text-xs text-stone-500">
                    Safe Razorpay checkout
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-stone-900">
                    ♡ Elegant Packaging
                  </p>

                  <p className="mt-1 text-xs text-stone-500">
                    Prepared with care
                  </p>
                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* Reviews */}
      <section className="mx-auto max-w-7xl px-6 pb-20 lg:px-8">
        <ReviewSection productId={product._id} />
      </section>

    </div>
  );
}

export default ProductDetails;
