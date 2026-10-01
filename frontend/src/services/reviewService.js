import api from "./api";

// Get reviews for a product
export const getProductReviews = async (productId) => {
  const response = await api.get(
    `/api/reviews/${productId}`
  );

  return response.data;
};

// Add a review
export const createReview = async (
  productId,
  rating,
  comment,
  photo = null
) => {
  // If there is no photo, use normal JSON
  // This keeps the original review flow working.
  if (!photo) {
    const response = await api.post(
      `/api/reviews/${productId}`,
      {
        rating,
        comment,
      }
    );

    return response.data;
  }

  // If there is a photo, use FormData
  const formData = new FormData();

  formData.append("rating", rating);
  formData.append("comment", comment);
  formData.append("photo", photo);

  const response = await api.post(
    `/api/reviews/${productId}`,
    formData
  );

  return response.data;
};

// Update a review
export const updateReview = async (
  reviewId,
  rating,
  comment,
  photo = null
) => {
  // No photo → normal JSON
  if (!photo) {
    const response = await api.put(
      `/api/reviews/${reviewId}`,
      {
        rating,
        comment,
      }
    );

    return response.data;
  }

  // Photo → FormData
  const formData = new FormData();

  formData.append("rating", rating);
  formData.append("comment", comment);
  formData.append("photo", photo);

  const response = await api.put(
    `/api/reviews/${reviewId}`,
    formData
  );

  return response.data;
};

// Delete a review
export const deleteReview = async (reviewId) => {
  const response = await api.delete(
    `/api/reviews/${reviewId}`
  );

  return response.data;
};