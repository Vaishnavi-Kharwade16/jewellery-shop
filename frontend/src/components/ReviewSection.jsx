import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import {
  createReview,
  deleteReview,
  getProductReviews,
  updateReview,
} from "../services/reviewService";

const API_URL = import.meta.env.VITE_API_URL;

function ReviewSection({ productId }) {
  const { token, user } = useAuth();

  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");

  const [editingReviewId, setEditingReviewId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch reviews
  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getProductReviews(productId);

      setReviews(data.reviews || []);
      setAverageRating(data.averageRating || 0);
      setTotalReviews(data.totalReviews || 0);
    } catch (error) {
      console.error("Fetch reviews error:", error);

      setError("Unable to load reviews.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  // Handle photo selection
  const handlePhotoChange = (event) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    setError("");
    setSuccess("");

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/jpg",
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      setError(
        "Only JPG, JPEG, PNG, and WEBP images are allowed."
      );

      event.target.value = "";
      return;
    }

    const maxSize = 5 * 1024 * 1024;

    if (selectedFile.size > maxSize) {
      setError("Photo size must be less than 5 MB.");

      event.target.value = "";
      return;
    }

    setPhoto(selectedFile);

    const previewUrl = URL.createObjectURL(selectedFile);
    setPhotoPreview(previewUrl);
  };

  // Remove selected photo
  const handleRemovePhoto = () => {
    setPhoto(null);
    setPhotoPreview("");

    const fileInput =
      document.getElementById("review-photo");

    if (fileInput) {
      fileInput.value = "";
    }
  };

  // Submit review
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!token) {
      setError("Please login to write a review.");
      return;
    }

    if (!comment.trim()) {
      setError("Please write a review.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      if (editingReviewId) {
        await updateReview(
          editingReviewId,
          rating,
          comment,
          photo
        );

        setSuccess("Your review has been updated.");
      } else {
        await createReview(
          productId,
          rating,
          comment,
          photo
        );

        setSuccess("Thank you for your review.");
      }

      setRating(5);
      setComment("");
      setPhoto(null);
      setPhotoPreview("");
      setEditingReviewId(null);

      const fileInput =
        document.getElementById("review-photo");

      if (fileInput) {
        fileInput.value = "";
      }

      await fetchReviews();
    } catch (error) {
      console.error("Review submit error:", error);

      const message =
        error.response?.data?.message ||
        "Unable to submit review.";

      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  // Start editing
  const handleEdit = (review) => {
    setEditingReviewId(review._id);
    setRating(review.rating);
    setComment(review.comment);

    // Existing photo is displayed, but we don't put it
    // into the file input. A new photo can replace it.
    setPhoto(null);

    if (review.photo) {
      setPhotoPreview(
        review.photo.startsWith("http")
          ? review.photo
          : `${API_URL}${review.photo}`
      );
    } else {
      setPhotoPreview("");
    }

    setError("");
    setSuccess("");

    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth",
    });
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingReviewId(null);
    setRating(5);
    setComment("");
    setPhoto(null);
    setPhotoPreview("");
    setError("");
    setSuccess("");

    const fileInput =
      document.getElementById("review-photo");

    if (fileInput) {
      fileInput.value = "";
    }
  };

  // Delete review
  const handleDelete = async (reviewId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this review?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await deleteReview(reviewId);

      setSuccess("Your review has been deleted.");

      await fetchReviews();
    } catch (error) {
      console.error("Delete review error:", error);

      const message =
        error.response?.data?.message ||
        "Unable to delete review.";

      setError(message);
    }
  };

  // Render stars
  const renderStars = (value, interactive = false) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? "button" : undefined}
            onClick={
              interactive
                ? () => setRating(star)
                : undefined
            }
            disabled={!interactive}
            className={`text-xl transition ${
              star <= value
                ? "text-[#b08d57]"
                : "text-stone-300"
            } ${
              interactive
                ? "cursor-pointer hover:scale-110"
                : "cursor-default"
            }`}
            aria-label={
              interactive
                ? `Give ${star} star${
                    star > 1 ? "s" : ""
                  }`
                : undefined
            }
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  return (
    <section className="mt-20 border-t border-stone-200 pt-16">
      {/* Header */}
      <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-[#b08d57]">
            Customer Experience
          </p>

          <h2 className="mt-3 font-serif text-4xl text-stone-900">
            Reviews & Ratings
          </h2>

          <p className="mt-3 max-w-xl text-sm leading-7 text-stone-500">
            Discover what other customers think about this
            jewellery piece.
          </p>
        </div>

        {/* Rating Summary */}
        <div className="rounded-3xl border border-stone-200 bg-white px-7 py-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div>
              <p className="font-serif text-4xl text-stone-900">
                {averageRating.toFixed(1)}
              </p>

              <div className="mt-1">
                {renderStars(
                  Math.round(averageRating)
                )}
              </div>
            </div>

            <div className="border-l border-stone-200 pl-4">
              <p className="text-sm font-medium text-stone-800">
                {totalReviews}{" "}
                {totalReviews === 1
                  ? "Review"
                  : "Reviews"}
              </p>

              <p className="mt-1 text-xs text-stone-500">
                Customer ratings
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-8 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm text-green-700">
          {success}
        </div>
      )}

      {/* Reviews */}
      <div className="mt-10">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-3xl border border-stone-200 bg-white p-6"
              >
                <div className="h-4 w-32 rounded bg-stone-200" />

                <div className="mt-4 h-3 w-24 rounded bg-stone-200" />

                <div className="mt-4 h-4 w-full rounded bg-stone-200" />

                <div className="mt-2 h-4 w-3/4 rounded bg-stone-200" />
              </div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="rounded-3xl border border-stone-200 bg-white px-6 py-12 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f4eee3] text-2xl text-[#b08d57]">
              ★
            </div>

            <h3 className="mt-5 font-serif text-2xl text-stone-900">
              No reviews yet
            </h3>

            <p className="mt-2 text-sm text-stone-500">
              Be the first to share your experience.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => {
              const reviewUserId = (
                review.user?._id ||
                review.user?.id
              )?.toString();

              const currentUserId = (
                user?._id ||
                user?.id
              )?.toString();

              const isOwnReview =
                Boolean(token) &&
                Boolean(reviewUserId) &&
                Boolean(currentUserId) &&
                reviewUserId === currentUserId;

              const reviewPhoto = review.photo
                ? review.photo.startsWith("http")
                  ? review.photo
                  : `${API_URL}${review.photo}`
                : "";

              return (
                <div
                  key={review._id}
                  className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f4eee3] font-serif text-lg text-[#b08d57]">
                          {review.user?.name
                            ?.charAt(0)
                            ?.toUpperCase() || "C"}
                        </div>

                        <div>
                          <p className="font-medium text-stone-900">
                            {review.user?.name ||
                              "Customer"}
                          </p>

                          <p className="text-xs text-stone-400">
                            {new Date(
                              review.createdAt
                            ).toLocaleDateString(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              }
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3">
                        {renderStars(review.rating)}
                      </div>
                    </div>

                    {/* Edit / Delete */}
                    {isOwnReview && (
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            handleEdit(review)
                          }
                          className="rounded-full border border-[#b08d57] px-4 py-2 text-sm font-medium text-[#b08d57] transition hover:bg-[#b08d57] hover:text-white"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(review._id)
                          }
                          className="rounded-full border border-red-200 px-4 py-2 text-sm font-medium text-red-500 transition hover:bg-red-500 hover:text-white"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>

                  <p className="mt-5 text-sm leading-7 text-stone-600">
                    {review.comment}
                  </p>

                  {/* Review Photo */}
                  {reviewPhoto && (
                    <div className="mt-5">
                      <img
                        src={reviewPhoto}
                        alt="Customer review"
                        className="max-h-[420px] w-auto max-w-full rounded-2xl border border-stone-200 object-cover shadow-sm"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Review Form */}
      {token ? (
        <div className="mt-10 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-[#b08d57]">
                {editingReviewId
                  ? "Update Your Review"
                  : "Share Your Experience"}
              </p>

              <h3 className="mt-2 font-serif text-2xl text-stone-900">
                {editingReviewId
                  ? "Edit your review"
                  : "How was your experience?"}
              </h3>
            </div>

            {editingReviewId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="text-sm text-stone-500 hover:text-stone-900"
              >
                Cancel
              </button>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-7"
          >
            {/* Rating */}
            <div>
              <label className="text-sm font-medium text-stone-800">
                Your Rating
              </label>

              <div className="mt-2">
                {renderStars(rating, true)}
              </div>
            </div>

            {/* Comment */}
            <div className="mt-6">
              <label
                htmlFor="review-comment"
                className="text-sm font-medium text-stone-800"
              >
                Your Review
              </label>

              <textarea
                id="review-comment"
                value={comment}
                onChange={(event) =>
                  setComment(event.target.value)
                }
                placeholder="Share your thoughts about this jewellery piece..."
                rows={5}
                maxLength={500}
                className="mt-2 w-full rounded-2xl border border-stone-200 bg-[#fdfbf7] px-4 py-4 text-sm text-stone-800 outline-none transition focus:border-[#b08d57] focus:ring-1 focus:ring-[#b08d57]"
              />

              <div className="mt-1 text-right text-xs text-stone-400">
                {comment.length}/500
              </div>
            </div>

            {/* Photo Upload */}
            <div className="mt-6">
              <label
                htmlFor="review-photo"
                className="text-sm font-medium text-stone-800"
              >
                Add a Photo{" "}
                <span className="font-normal text-stone-400">
                  (optional)
                </span>
              </label>

              <input
                id="review-photo"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/jpg"
                onChange={handlePhotoChange}
                className="mt-2 block w-full cursor-pointer rounded-2xl border border-stone-200 bg-[#fdfbf7] px-4 py-3 text-sm text-stone-600 file:mr-4 file:rounded-full file:border-0 file:bg-stone-900 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-[#b08d57]"
              />

              <p className="mt-2 text-xs text-stone-400">
                JPG, PNG, WEBP • Maximum 5 MB
              </p>

              {/* Photo Preview */}
              {photoPreview && (
                <div className="relative mt-4 w-fit">
                  <img
                    src={photoPreview}
                    alt="Review preview"
                    className="max-h-64 max-w-xs rounded-2xl border border-stone-200 object-cover shadow-sm"
                  />

                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-stone-900 text-sm text-white shadow transition hover:bg-red-500"
                    aria-label="Remove photo"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-5 rounded-full bg-stone-900 px-7 py-3 text-sm font-medium text-white transition hover:bg-[#b08d57] disabled:cursor-not-allowed disabled:bg-stone-300"
            >
              {submitting
                ? "Saving..."
                : editingReviewId
                ? "Update Review"
                : "Submit Review"}
            </button>
          </form>
        </div>
      ) : (
        <div className="mt-10 rounded-3xl border border-stone-200 bg-[#f4eee3] px-6 py-8 text-center">
          <p className="text-sm text-stone-600">
            Please{" "}
            <Link
              to="/login"
              className="font-medium text-[#b08d57] hover:underline"
            >
              login
            </Link>{" "}
            to share your review.
          </p>
        </div>
      )}
    </section>
  );
}

export default ReviewSection;
