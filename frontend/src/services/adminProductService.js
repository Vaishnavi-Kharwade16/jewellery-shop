import api from "./api";

// Get all products for admin
export const getAdminProducts = async () => {
  const response = await api.get("/api/products/admin");

  return response.data;
};

// Create product
export const createProduct = async (productData) => {
  const response = await api.post(
    "/api/products",
    productData
  );

  return response.data;
};

// Update product
export const updateProduct = async (
  productId,
  productData
) => {
  const response = await api.put(
    `/api/products/${productId}`,
    productData
  );

  return response.data;
};

// Deactivate product
export const deleteProduct = async (productId) => {
  const response = await api.delete(
    `/api/products/${productId}`
  );

  return response.data;
};