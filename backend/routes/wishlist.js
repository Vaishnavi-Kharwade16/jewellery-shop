const express = require("express");

const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} = require("../controllers/wishlistController");

const { authenticate } = require("../middleware/auth");

const router = express.Router();

router.get("/", authenticate, getWishlist);

router.post("/:productId", authenticate, addToWishlist);

router.delete("/:productId", authenticate, removeFromWishlist);

module.exports = router;