import api from "./api";

export const getCart = async () => {
  const response = await api.get("/api/cart");

  return response.data;
};

export const addToCart = async (productId, quantity = 1) => {
  const response = await api.post("/api/cart", {
    productId,
    quantity,
  });

  return response.data;
};

export const updateCartItem = async (
  productId,
  quantity
) => {
  const response = await api.put(
    `/api/cart/${productId}`,
    {
      quantity,
    }
  );

  return response.data;
};

export const removeFromCart = async (productId) => {
  const response = await api.delete(
    `/api/cart/${productId}`
  );

  return response.data;
};

export const clearCart = async () => {
  const response = await api.delete("/api/cart");

  return response.data;
};