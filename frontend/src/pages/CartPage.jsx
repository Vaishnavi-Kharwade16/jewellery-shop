import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

function CartPage() {
  const {
    cart,
    cartTotal,
    loading,
    error,
    increaseQuantity,
    decreaseQuantity,
    removeItem,
    emptyCart,
  } = useCart();

  const items = cart?.items || [];

  // ---------------------------------------------
  // INCREASE QUANTITY
  // ---------------------------------------------
  const handleIncrease = async (productId) => {
    try {
      await increaseQuantity(productId);
    } catch (error) {
      console.error("Increase quantity error:", error);
    }
  };

  // ---------------------------------------------
  // DECREASE QUANTITY
  // ---------------------------------------------
  const handleDecrease = async (productId) => {
    try {
      await decreaseQuantity(productId);
    } catch (error) {
      console.error("Decrease quantity error:", error);
    }
  };

  // ---------------------------------------------
  // REMOVE PRODUCT
  // ---------------------------------------------
  const handleRemove = async (productId) => {
    try {
      await removeItem(productId);
    } catch (error) {
      console.error("Remove item error:", error);
    }
  };

  // ---------------------------------------------
  // CLEAR CART
  // ---------------------------------------------
  const handleClearCart = async () => {
    try {
      await emptyCart();
    } catch (error) {
      console.error("Clear cart error:", error);
    }
  };

  // ---------------------------------------------
  // LOADING
  // ---------------------------------------------
  if (loading && items.length === 0) {
    return (
      <div className="min-h-screen bg-[#fdfbf7] px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto h-10 w-48 animate-pulse rounded bg-stone-200" />

          <div className="mt-12 space-y-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-32 animate-pulse rounded-3xl bg-stone-200"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------
  // EMPTY CART
  // ---------------------------------------------
  if (items.length === 0) {
    return (
      <div className="min-h-[75vh] bg-[#fdfbf7] px-6 py-20">
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#f4eee3] text-4xl text-[#b08d57]">
            ♢
          </div>

          <p className="mt-8 text-xs font-medium tracking-[0.35em] text-[#b08d57]">
            YOUR COLLECTION
          </p>

          <h1 className="mt-3 font-serif text-5xl text-stone-900">
            Your Cart is Empty
          </h1>

          <p className="mt-5 max-w-md leading-7 text-stone-500">
            Your favourite jewellery pieces will appear here once you add
            them to your collection.
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
            YOUR COLLECTION
          </p>

          <h1 className="mt-3 font-serif text-5xl text-stone-900">
            Shopping Cart
          </h1>

          <p className="mt-4 text-stone-600">
            {items.length}{" "}
            {items.length === 1 ? "item" : "items"} selected for you.
          </p>
        </div>
      </section>

      {/* Cart */}
      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">

          {/* Items */}
          <div className="space-y-4">

            {/* Error Message */}
            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
                {error}
              </div>
            )}

            {items.map((item) => {
              const product = item.product;

              if (!product) return null;

              const productId = product._id;

              return (
                <div
                  key={productId}
                  className="group rounded-3xl border border-stone-200 bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6"
                >
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

                    {/* Image */}
                    <div className="flex h-32 w-full shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#f4eee3] sm:w-32">
                      {product.images?.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <span className="text-3xl text-[#b08d57]">
                          ✦
                        </span>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1">
                      <p className="text-xs uppercase tracking-[0.2em] text-[#b08d57]">
                        {product.metalType || "Fine Jewellery"}
                      </p>

                      <h2 className="mt-1 font-serif text-2xl text-stone-900">
                        {product.name}
                      </h2>

                      <p className="mt-2 text-sm text-stone-500">
                        ₹
                        {Number(product.price).toLocaleString("en-IN")}{" "}
                        per piece
                      </p>

                      {/* Stock */}
                      <p className="mt-2 text-xs text-stone-400">
                        {product.stock > 0
                          ? `${product.stock} available`
                          : "Out of stock"}
                      </p>
                    </div>

                    {/* Quantity + Price */}
                    <div className="flex items-center justify-between gap-6 sm:flex-col sm:items-end">

                      {/* Quantity Controls */}
                      <div className="flex items-center overflow-hidden rounded-full border border-stone-300">

                        {/* Decrease */}
                        <button
                          type="button"
                          disabled={loading}
                          onClick={() =>
                            handleDecrease(productId)
                          }
                          className="flex h-9 w-9 items-center justify-center text-lg text-stone-700 transition hover:bg-[#f4eee3] hover:text-[#b08d57] disabled:cursor-not-allowed disabled:text-stone-300"
                          aria-label={`Decrease quantity of ${product.name}`}
                        >
                          −
                        </button>

                        {/* Quantity */}
                        <span className="w-10 text-center text-sm font-medium text-stone-900">
                          {item.quantity}
                        </span>

                        {/* Increase */}
                        <button
                          type="button"
                          disabled={
                            loading ||
                            item.quantity >= product.stock
                          }
                          onClick={() =>
                            handleIncrease(productId)
                          }
                          className="flex h-9 w-9 items-center justify-center text-lg text-stone-700 transition hover:bg-[#f4eee3] hover:text-[#b08d57] disabled:cursor-not-allowed disabled:text-stone-300"
                          aria-label={`Increase quantity of ${product.name}`}
                        >
                          +
                        </button>

                      </div>

                      {/* Price + Remove */}
                      <div className="text-right">
                        <p className="font-serif text-xl text-stone-900">
                          ₹
                          {(
                            Number(product.price) *
                            item.quantity
                          ).toLocaleString("en-IN")}
                        </p>

                        <button
                          type="button"
                          disabled={loading}
                          onClick={() =>
                            handleRemove(productId)
                          }
                          className="mt-1 text-xs text-stone-400 underline underline-offset-4 transition hover:text-red-600 disabled:cursor-not-allowed disabled:text-stone-300"
                        >
                          Remove
                        </button>
                      </div>

                    </div>
                  </div>
                </div>
              );
            })}

            {/* Clear Cart */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                disabled={loading}
                onClick={handleClearCart}
                className="text-sm text-stone-500 underline underline-offset-4 transition hover:text-red-600 disabled:cursor-not-allowed disabled:text-stone-300"
              >
                Clear Cart
              </button>
            </div>
          </div>

          {/* Summary */}
          <aside className="h-fit rounded-3xl bg-stone-900 p-7 text-white shadow-xl lg:sticky lg:top-24">

            <p className="text-xs tracking-[0.3em] text-[#d8b979]">
              ORDER SUMMARY
            </p>

            <h2 className="mt-3 font-serif text-3xl">
              Your Selection
            </h2>

            <div className="my-7 border-t border-stone-700" />

            <div className="flex justify-between text-sm text-stone-300">
              <span>Items</span>
              <span>{items.length}</span>
            </div>

            <div className="mt-4 flex justify-between text-sm text-stone-300">
              <span>Total Quantity</span>
              <span>
                {items.reduce(
                  (total, item) =>
                    total + Number(item.quantity),
                  0
                )}
              </span>
            </div>

            <div className="mt-4 flex justify-between text-sm text-stone-300">
              <span>Subtotal</span>

              <span>
                ₹
                {Number(cartTotal).toLocaleString("en-IN")}
              </span>
            </div>

            <div className="my-7 border-t border-stone-700" />

            <div className="flex items-center justify-between">
              <span className="text-stone-300">
                Total
              </span>

              <span className="font-serif text-3xl text-[#d8b979]">
                ₹
                {Number(cartTotal).toLocaleString("en-IN")}
              </span>
            </div>

            <Link
              to="/checkout"
              className="mt-8 block rounded-full bg-[#b08d57] px-6 py-3.5 text-center text-sm font-medium text-white transition hover:bg-[#d8b979]"
            >
              Proceed to Checkout
            </Link>

            <Link
              to="/products"
              className="mt-3 block text-center text-sm text-stone-400 transition hover:text-white"
            >
              Continue Shopping
            </Link>

          </aside>
        </div>
      </section>
    </div>
  );
}

export default CartPage;
