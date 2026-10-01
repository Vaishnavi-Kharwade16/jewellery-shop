import api from "./api";

// Get admin dashboard statistics
export const getAdminOrderStats = async () => {
  const response = await api.get(
    "/api/orders/admin/stats"
  );

  return response.data;
};