import { Link } from "react-router-dom";

import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";

function WishlistPage() {
  const {
    wishlist,
    loading: wishlistLoading,
    removeFromWishlist,
  } = useWishlist();

  const { addToCart, loading: cartLoading } = useCart();

  const handleRemove = async (productId) => {
    try {
      await removeFromWishlist(productId);
    } catch (error) {
      console.error("Remove wishlist error:", error);
    }
  };

  const handleAddToCart = async (productId) => {
    try {
      await addToCart(productId, 1);
    } catch (error) {
      console.error("Add to cart error:", error);
    }
  };

  if (wishlistLoading) {
    return (
      <section className="min-h-screen bg-[#fdfbf7] px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <div className="mx-auto h-4 w-32 animate-pulse rounded bg-stone-200" />

            <div className="mx-auto mt-4 h-10 w-64 animate-pulse rounded bg-stone-200" />
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="animate-pulse overflow-hidden rounded-3xl border border-stone-200 bg-white"
              >
                <div className="h-80 bg-[#f4eee3]" />

                <div className="space-y-4 p-6">
                  <div className="h-3 w-24 rounded bg-stone-200" />
                  <div className="h-6 w-40 rounded bg-stone-200" />
                  <div className="h-4 w-full rounded bg-stone-200" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[#fdfbf7] px-6 py-16 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-[#b08d57]">
            Your Collection
          </p>

          <h1 className="mt-3 font-serif text-4xl text-stone-900 md:text-5xl">
            My Wishlist
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-stone-500">
            Keep the jewellery you love close and come back to it whenever
            you're ready.
          </p>
        </div>

        {/* Empty Wishlist */}
        {wishlist.length === 0 && (
          <div className="mx-auto mt-16 max-w-2xl rounded-3xl border border-stone-200 bg-white px-6 py-16 text-center shadow-sm">

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#f4eee3] text-4xl text-[#b08d57]">
              ♡
            </div>

            <h2 className="mt-6 font-serif text-3xl text-stone-900">
              Your wishlist is empty
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-stone-500">
              Save your favourite jewellery pieces here and revisit them
              whenever you are ready.
            </p>

            <Link
              to="/products"
              className="mt-7 inline-flex rounded-full bg-stone-900 px-7 py-3 text-sm font-medium text-white transition hover:bg-[#b08d57]"
            >
              Explore Collection
            </Link>
          </div>
        )}

        {/* Wishlist Products */}
        {wishlist.length > 0 && (
          <>
            <div className="mt-10 flex items-center justify-between">
              <p className="text-sm text-stone-500">
                {wishlist.length} saved{" "}
                {wishlist.length === 1 ? "piece" : "pieces"}
              </p>

              <Link
                to="/products"
                className="text-sm font-medium text-[#b08d57] hover:underline"
              >
                Continue Shopping
              </Link>
            </div>

            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {wishlist.map((product) => (
                <div
                  key={product._id}
                  className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  {/* Image */}
                  <Link to={`/products/${product._id}`}>
                    <div className="relative flex h-80 items-center justify-center overflow-hidden bg-[#f4eee3]">
                      {product.images?.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="h-full w-full object-cover transition duration-500 hover:scale-105"
                        />
                      ) : (
                        <span className="font-serif text-4xl text-[#b08d57]">
                          ✦
                        </span>
                      )}

                      <span className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-stone-700 shadow-sm backdrop-blur">
                        Saved
                      </span>
                    </div>
                  </Link>

                  {/* Details */}
                  <div className="p-6">
                    <p className="text-xs uppercase tracking-[0.25em] text-[#b08d57]">
                      {product.metalType || "Fine Jewellery"}
                    </p>

                    <Link to={`/products/${product._id}`}>
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
                        {Number(product.price).toLocaleString(
                          "en-IN"
                        )}
                      </p>

                      {product.stock > 0 ? (
                        <span className="text-xs text-stone-500">
                          {product.stock} available
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-red-500">
                          Sold Out
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="mt-5 flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleRemove(product._id)
                        }
                        disabled={wishlistLoading}
                        className="flex-1 rounded-full border border-stone-300 px-4 py-3 text-sm font-medium text-stone-700 transition hover:border-red-300 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Remove
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleAddToCart(product._id)
                        }
                        disabled={
                          cartLoading ||
                          product.stock <= 0
                        }
                        className="flex-1 rounded-full bg-stone-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-[#b08d57] disabled:cursor-not-allowed disabled:bg-stone-300"
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
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default WishlistPage;