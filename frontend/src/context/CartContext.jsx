import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  getCart,
  addToCart as addProductToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "../services/cartService";

import api from "../services/api";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

const GUEST_CART_KEY = "guestCart";

const getGuestCart = () => {
  try {
    const savedCart = localStorage.getItem(GUEST_CART_KEY);

    if (!savedCart) {
      return { items: [] };
    }

    const parsedCart = JSON.parse(savedCart);

    if (!parsedCart?.items || !Array.isArray(parsedCart.items)) {
      return { items: [] };
    }

    return parsedCart;
  } catch (error) {
    console.error("Read guest cart error:", error);
    return { items: [] };
  }
};

const saveGuestCart = (cart) => {
  localStorage.setItem(
    GUEST_CART_KEY,
    JSON.stringify(cart)
  );
};

const clearGuestCartStorage = () => {
  localStorage.removeItem(GUEST_CART_KEY);
};

const getProductId = (item) => {
  return item.product?._id || item.product;
};

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();

  const [cart, setCart] = useState({
    items: [],
  });

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  // --------------------------------------------------
  // MERGE GUEST CART INTO USER CART AFTER LOGIN
  // --------------------------------------------------

  const mergeGuestCart = async () => {
    const guestCart = getGuestCart();

    if (!guestCart.items.length) {
      return;
    }

    try {
      for (const item of guestCart.items) {
        const productId = getProductId(item);

        if (!productId || !item.quantity) {
          continue;
        }

        try {
          await addProductToCart(
            productId,
            item.quantity
          );
        } catch (error) {
          console.error(
            `Could not merge product ${productId}:`,
            error
          );
        }
      }

      clearGuestCartStorage();
    } catch (error) {
      console.error("Merge guest cart error:", error);
    }
  };

  // --------------------------------------------------
  // FETCH CART
  // --------------------------------------------------

  const fetchCart = async () => {
    if (!isAuthenticated) {
      const guestCart = getGuestCart();

      setCart(guestCart);
      return;
    }

    try {
      setLoading(true);
      setError("");

      await mergeGuestCart();

      const data = await getCart();

      setCart(data);
    } catch (err) {
      console.error("Fetch cart error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to fetch cart"
      );
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // ADD PRODUCT
  // --------------------------------------------------

  const addToCart = async (
    productId,
    quantity = 1
  ) => {
    try {
      setLoading(true);
      setError("");

      // -------------------------------
      // GUEST CART
      // -------------------------------

      if (!isAuthenticated) {
        const productResponse = await api.get(
          `/api/products/${productId}`
        );

        const product = productResponse.data;

        if (!product || !product.isActive) {
          throw new Error("Product is unavailable");
        }

        if (product.stock < Number(quantity)) {
          throw new Error("Insufficient stock");
        }

        const guestCart = getGuestCart();

        const existingItem = guestCart.items.find(
          (item) =>
            getProductId(item) === productId
        );

        if (existingItem) {
          const newQuantity =
            existingItem.quantity +
            Number(quantity);

          if (newQuantity > product.stock) {
            throw new Error("Insufficient stock");
          }

          existingItem.quantity = newQuantity;

          // Refresh product information.
          existingItem.product = product;
        } else {
          guestCart.items.push({
            product,
            quantity: Number(quantity),
          });
        }

        saveGuestCart(guestCart);

        setCart(guestCart);

        return {
          message: "Product added to guest cart",
          cart: guestCart,
        };
      }

      // -------------------------------
      // AUTHENTICATED CART
      // -------------------------------

      const data = await addProductToCart(
        productId,
        quantity
      );

      setCart(data.cart);

      return data;
    } catch (err) {
      console.error("Add to cart error:", err);

      const message =
        err.response?.data?.message ||
        err.message ||
        "Failed to add product to cart";

      setError(message);

      throw err;
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // UPDATE QUANTITY
  // --------------------------------------------------

  const updateQuantity = async (
    productId,
    quantity
  ) => {
    try {
      setLoading(true);
      setError("");

      // -------------------------------
      // GUEST CART
      // -------------------------------

      if (!isAuthenticated) {
        const guestCart = getGuestCart();

        const item = guestCart.items.find(
          (item) =>
            getProductId(item) === productId
        );

        if (!item) {
          throw new Error(
            "Product is not in cart"
          );
        }

        const stock =
          item.product?.stock ?? 0;

        if (Number(quantity) > stock) {
          throw new Error("Insufficient stock");
        }

        item.quantity = Number(quantity);

        saveGuestCart(guestCart);

        setCart(guestCart);

        return {
          message: "Guest cart updated",
          cart: guestCart,
        };
      }

      // -------------------------------
      // AUTHENTICATED CART
      // -------------------------------

      const data = await updateCartItem(
        productId,
        quantity
      );

      setCart(data.cart);

      return data;
    } catch (err) {
      console.error(
        "Update cart quantity error:",
        err
      );

      const message =
        err.response?.data?.message ||
        err.message ||
        "Failed to update cart";

      setError(message);

      throw err;
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // INCREASE QUANTITY
  // --------------------------------------------------

  const increaseQuantity = async (productId) => {
    const item = cart.items.find(
      (item) =>
        getProductId(item) === productId
    );

    if (!item) return;

    await updateQuantity(
      productId,
      item.quantity + 1
    );
  };

  // --------------------------------------------------
  // DECREASE QUANTITY
  // --------------------------------------------------

  const decreaseQuantity = async (productId) => {
    const item = cart.items.find(
      (item) =>
        getProductId(item) === productId
    );

    if (!item) return;

    if (item.quantity === 1) {
      await removeItem(productId);
      return;
    }

    await updateQuantity(
      productId,
      item.quantity - 1
    );
  };

  // --------------------------------------------------
  // REMOVE PRODUCT
  // --------------------------------------------------

  const removeItem = async (productId) => {
    try {
      setLoading(true);
      setError("");

      // -------------------------------
      // GUEST CART
      // -------------------------------

      if (!isAuthenticated) {
        const guestCart = getGuestCart();

        guestCart.items =
          guestCart.items.filter(
            (item) =>
              getProductId(item) !== productId
          );

        saveGuestCart(guestCart);

        setCart(guestCart);

        return {
          message: "Product removed from cart",
          cart: guestCart,
        };
      }

      // -------------------------------
      // AUTHENTICATED CART
      // -------------------------------

      const data = await removeFromCart(
        productId
      );

      setCart(data.cart);

      return data;
    } catch (err) {
      console.error(
        "Remove from cart error:",
        err
      );

      const message =
        err.response?.data?.message ||
        err.message ||
        "Failed to remove product";

      setError(message);

      throw err;
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // CLEAR CART
  // --------------------------------------------------

  const emptyCart = async () => {
    try {
      setLoading(true);
      setError("");

      // -------------------------------
      // GUEST CART
      // -------------------------------

      if (!isAuthenticated) {
        clearGuestCartStorage();

        const emptyGuestCart = {
          items: [],
        };

        setCart(emptyGuestCart);

        return {
          message: "Cart cleared",
          cart: emptyGuestCart,
        };
      }

      // -------------------------------
      // AUTHENTICATED CART
      // -------------------------------

      const data = await clearCart();

      setCart(data.cart);

      return data;
    } catch (err) {
      console.error(
        "Clear cart error:",
        err
      );

      const message =
        err.response?.data?.message ||
        err.message ||
        "Failed to clear cart";

      setError(message);

      throw err;
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // CALCULATE TOTAL
  // --------------------------------------------------

  const cartTotal = cart.items.reduce(
    (total, item) => {
      const price =
        item.product?.price || 0;

      return (
        total +
        Number(price) * item.quantity
      );
    },
    0
  );

  // --------------------------------------------------
  // TOTAL NUMBER OF PRODUCTS
  // --------------------------------------------------

  const cartItemCount = cart.items.reduce(
    (total, item) => {
      return total + item.quantity;
    },
    0
  );

  // --------------------------------------------------
  // FETCH CART WHEN LOGIN STATUS CHANGES
  // --------------------------------------------------

  useEffect(() => {
    fetchCart();
  }, [isAuthenticated]);

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        error,

        fetchCart,

        addToCart,
        updateQuantity,
        increaseQuantity,
        decreaseQuantity,
        removeItem,
        emptyCart,

        cartTotal,
        cartItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// --------------------------------------------------
// CUSTOM HOOK
// --------------------------------------------------

export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider"
    );
  }

  return context;
};