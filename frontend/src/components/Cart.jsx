import { useCart } from "../context/CartContext";

function Cart() {
  const {
    cart,
    loading,
    error,
    increaseQuantity,
    decreaseQuantity,
    removeItem,
    emptyCart,
    cartTotal,
    cartItemCount,
  } = useCart();

  if (loading && cart.items.length === 0) {
    return (
      <div className="payment-card">
        <h2>Your Cart</h2>
        <p>Loading cart...</p>
      </div>
    );
  }

  return (
    <div className="payment-card">
      <h2>Your Cart</h2>

      {error && (
        <p style={{ color: "red" }}>
          {error}
        </p>
      )}

      {cart.items.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          {cart.items.map((item) => {
            const product = item.product;

            if (!product) return null;

            return (
              <div
                key={product._id}
                style={{
                  border: "1px solid #ddd",
                  padding: "15px",
                  marginBottom: "10px",
                  borderRadius: "8px",
                }}
              >
                <h3>{product.name}</h3>

                <p>
                  Price: ₹
                  {product.price.toLocaleString("en-IN")}
                </p>

                <p>
                  Quantity: {item.quantity}
                </p>

                <div>
                  <button
                    type="button"
                    onClick={() =>
                      decreaseQuantity(product._id)
                    }
                    disabled={loading}
                  >
                    −
                  </button>

                  <span
                    style={{
                      margin: "0 15px",
                    }}
                  >
                    {item.quantity}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      increaseQuantity(product._id)
                    }
                    disabled={loading}
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    removeItem(product._id)
                  }
                  disabled={loading}
                  style={{
                    marginTop: "10px",
                  }}
                >
                  Remove
                </button>
              </div>
            );
          })}

          <hr />

          <p>
            <strong>
              Items: {cartItemCount}
            </strong>
          </p>

          <p>
            <strong>
              Total: ₹
              {cartTotal.toLocaleString("en-IN")}
            </strong>
          </p>

          <button
            type="button"
            onClick={emptyCart}
            disabled={loading}
          >
            Clear Cart
          </button>
        </>
      )}
    </div>
  );
}

export default Cart;
