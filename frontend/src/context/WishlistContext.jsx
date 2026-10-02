import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import api from "../services/api";
import { useAuth } from "./AuthContext";

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { token } = useAuth();

  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch wishlist when user logs in
  const fetchWishlist = async () => {
    if (!token) {
      setWishlist([]);
      return;
    }

    try {
      setLoading(true);

      const response = await api.get("/api/wishlist");

      setWishlist(response.data.products || []);
    } catch (error) {
      console.error("Fetch wishlist error:", error);
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [token]);

  // Add product to wishlist
  const addToWishlist = async (productId) => {
    try {
      setLoading(true);

      const response = await api.post(
        `/api/wishlist/${productId}`
      );

      setWishlist(response.data.wishlist.products || []);

      return response.data;
    } catch (error) {
      console.error("Add to wishlist error:", error);

      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Remove product from wishlist
  const removeFromWishlist = async (productId) => {
    try {
      setLoading(true);

      const response = await api.delete(
        `/api/wishlist/${productId}`
      );

      setWishlist(response.data.wishlist.products || []);

      return response.data;
    } catch (error) {
      console.error("Remove from wishlist error:", error);

      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Check whether a product is already in wishlist
  const isInWishlist = (productId) => {
    return wishlist.some(
      (product) => product._id === productId
    );
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        loading,
        fetchWishlist,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);

  if (!context) {
    throw new Error(
      "useWishlist must be used inside WishlistProvider"
    );
  }

  return context;
};
