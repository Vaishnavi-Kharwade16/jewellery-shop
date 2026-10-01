const Review = require("../models/Review");
const Product = require("../models/Product");

// GET /api/reviews/:productId
// Get all reviews for a product
const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    const reviews = await Review.find({
      product: productId,
    })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    const totalReviews = reviews.length;

    const averageRating =
      totalReviews > 0
        ? reviews.reduce(
            (sum, review) => sum + review.rating,
            0
          ) / totalReviews
        : 0;

    res.json({
      reviews,
      totalReviews,
      averageRating: Number(
        averageRating.toFixed(1)
      ),
    });
  } catch (error) {
    console.error(
      "Get reviews error:",
      error
    );

    res.status(500).json({
      message: "Failed to fetch reviews",
    });
  }
};

// POST /api/reviews/:productId
// Create a review for a product
const createReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, comment } = req.body;

    // Check product exists
    const product = await Product.findOne({
      _id: productId,
      isActive: true,
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    // Validate rating
    if (
      !rating ||
      Number(rating) < 1 ||
      Number(rating) > 5
    ) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5",
      });
    }

    // Validate comment
    if (
      !comment ||
      comment.trim().length < 3
    ) {
      return res.status(400).json({
        message:
          "Comment must contain at least 3 characters",
      });
    }

    // Check if user already reviewed this product
    const existingReview =
      await Review.findOne({
        product: productId,
        user: req.user.id,
      });

    if (existingReview) {
      return res.status(409).json({
        message:
          "You have already reviewed this product",
      });
    }

    // Photo path
    const photo = req.file
      ? `/uploads/reviews/${req.file.filename}`
      : "";

    const review = await Review.create({
      product: productId,
      user: req.user.id,
      rating: Number(rating),
      comment: comment.trim(),
      photo,
    });

    await review.populate("user", "name");

    res.status(201).json({
      message: "Review added successfully",
      review,
    });
  } catch (error) {
    console.error(
      "Create review error:",
      error
    );

    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({
        message:
          "You have already reviewed this product",
      });
    }

    res.status(500).json({
      message: "Failed to add review",
    });
  }
};

// PUT /api/reviews/:reviewId
// Update user's own review
const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;

    const review = await Review.findOne({
      _id: reviewId,
      user: req.user.id,
    });

    if (!review) {
      return res.status(404).json({
        message: "Review not found",
      });
    }

    // Validate rating
    if (
      !rating ||
      Number(rating) < 1 ||
      Number(rating) > 5
    ) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5",
      });
    }

    // Validate comment
    if (
      !comment ||
      comment.trim().length < 3
    ) {
      return res.status(400).json({
        message:
          "Comment must contain at least 3 characters",
      });
    }

    review.rating = Number(rating);
    review.comment = comment.trim();

    // Replace photo only when a new photo is uploaded
    if (req.file) {
      review.photo = `/uploads/reviews/${req.file.filename}`;
    }

    await review.save();
    await review.populate("user", "name");

    res.json({
      message: "Review updated successfully",
      review,
    });
  } catch (error) {
    console.error(
      "Update review error:",
      error
    );

    res.status(500).json({
      message: "Failed to update review",
    });
  }
};

// DELETE /api/reviews/:reviewId
// Delete user's own review
const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findOne({
      _id: reviewId,
      user: req.user.id,
    });

    if (!review) {
      return res.status(404).json({
        message: "Review not found",
      });
    }

    await review.deleteOne();

    res.json({
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete review error:",
      error
    );

    res.status(500).json({
      message: "Failed to delete review",
    });
  }
};

module.exports = {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
};