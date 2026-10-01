const express = require("express");

const {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
} = require("../controllers/reviewController");

const { authenticate } = require("../middleware/auth");
const uploadReviewPhoto = require("../middleware/uploadReview");

const router = express.Router();

router.get(
  "/:productId",
  getProductReviews
);

router.post(
  "/:productId",
  authenticate,
  uploadReviewPhoto.single("photo"),
  createReview
);

router.put(
  "/:reviewId",
  authenticate,
  uploadReviewPhoto.single("photo"),
  updateReview
);

router.delete(
  "/:reviewId",
  authenticate,
  deleteReview
);

module.exports = router;