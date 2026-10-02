import { Link } from "react-router-dom";

import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";

function ProductCard({ product }) {
  const { addToCart, loading: cartLoading } = useCart();

  const { token } = useAuth();

  const {
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    loading: wishlistLoading,
  } = useWishlist();

  const inWishlist = isInWishlist(product._id);

  const handleAddToCart = async () => {
    try {
      await addToCart(product._id, 1);
    } catch (error) {
      console.error("Add to cart error:", error);
    }
  };

  const handleWishlist = async () => {
    if (!token) {
      alert("Please login to add items to your wishlist.");
      return;
    }

    try {
      if (inWishlist) {
        await removeFromWishlist(product._id);
      } else {
        await addToWishlist(product._id);
      }
    } catch (error) {
      console.error("Wishlist error:", error);

      const message =
        error.response?.data?.message ||
        "Unable to update wishlist.";

      alert(message);
    }
  };

  return (
    <div className="group overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">

      {/* Product Image */}
      <div className="relative">

        <Link to={`/products/${product._id}`}>
          <div className="relative flex h-80 items-center justify-center overflow-hidden bg-[#f4eee3]">

            {product.images?.length > 0 ? (
              <img
                src={product.images[0]}
                alt={product.name}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <span className="font-serif text-4xl text-[#b08d57]">
                  ✦
                </span>
              </div>
            )}

          </div>
        </Link>

        {/* Stock Badge */}
        <div className="absolute right-4 top-4">
          {product.stock > 0 ? (
            <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-stone-700 shadow-sm backdrop-blur">
              In Stock
            </span>
          ) : (
            <span className="rounded-full bg-stone-900 px-3 py-1 text-xs font-medium text-white">
              Sold Out
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={handleWishlist}
          disabled={wishlistLoading}
          aria-label={
            inWishlist
              ? "Remove from wishlist"
              : "Add to wishlist"
          }
          className={`absolute left-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border bg-white/95 text-xl shadow-sm backdrop-blur transition-all duration-200 ${
            inWishlist
              ? "border-[#b08d57] text-[#b08d57]"
              : "border-stone-200 text-stone-500 hover:border-[#b08d57] hover:text-[#b08d57]"
          } disabled:cursor-not-allowed disabled:opacity-60`}
        >
          {inWishlist ? "♥" : "♡"}
        </button>
      </div>

      {/* Product Details */}
      <div className="p-6">

        <Link to={`/products/${product._id}`}>
          <p className="text-xs uppercase tracking-[0.25em] text-[#b08d57]">
            {product.metalType || "Fine Jewellery"}
          </p>

          <h2 className="mt-2 font-serif text-2xl text-stone-900 transition hover:text-[#b08d57]">
            {product.name}
          </h2>
        </Link>

        {product.description && (
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-stone-500">
            {product.description}
          </p>
        )}

        <div className="mt-5 flex items-center justify-between">

          <p className="text-xl font-semibold text-stone-900">
            ₹
            {Number(product.price).toLocaleString("en-IN")}
          </p>

          {product.stock > 0 && (
            <span className="text-xs text-stone-500">
              {product.stock} available
            </span>
          )}

        </div>

        {/* Actions */}
        <div className="mt-5 flex gap-2">

          <Link
            to={`/products/${product._id}`}
            className="flex-1 rounded-full border border-stone-300 px-4 py-3 text-center text-sm font-medium text-stone-700 transition hover:border-[#b08d57] hover:text-[#b08d57]"
          >
            View Details
          </Link>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={
              cartLoading ||
              product.stock <= 0
            }
            className="flex-1 rounded-full bg-stone-900 px-4 py-3 text-sm font-medium text-white transition-all duration-300 hover:bg-[#b08d57] disabled:cursor-not-allowed disabled:bg-stone-300"
          >
            {product.stock <= 0
              ? "Sold Out"
              : cartLoading
              ? "Adding..."
              : "Add to Cart"}
          </button>

        </div>

      </div>
    </div>
  );
}

export default ProductCard;
