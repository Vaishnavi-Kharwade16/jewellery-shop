const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");

// GET /api/wishlist
const getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({
      user: req.user.id,
    }).populate("products");

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: req.user.id,
        products: [],
      });
    }

    res.json(wishlist);
  } catch (error) {
    console.error("Get wishlist error:", error);

    res.status(500).json({
      message: "Failed to fetch wishlist",
    });
  }
};

// POST /api/wishlist/:productId
const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findOne({
      _id: productId,
      isActive: true,
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    let wishlist = await Wishlist.findOne({
      user: req.user.id,
    });

    if (!wishlist) {
      wishlist = new Wishlist({
        user: req.user.id,
        products: [],
      });
    }

    const alreadyExists = wishlist.products.some(
      (id) => id.toString() === productId
    );

    if (alreadyExists) {
      return res.status(409).json({
        message: "Product is already in wishlist",
      });
    }

    wishlist.products.push(productId);

    await wishlist.save();
    await wishlist.populate("products");

    res.status(201).json({
      message: "Product added to wishlist",
      wishlist,
    });
  } catch (error) {
    console.error("Add wishlist error:", error);

    res.status(500).json({
      message: "Failed to add product to wishlist",
    });
  }
};

// DELETE /api/wishlist/:productId
const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({
      user: req.user.id,
    });

    if (!wishlist) {
      return res.status(404).json({
        message: "Wishlist not found",
      });
    }

    const originalLength = wishlist.products.length;

    wishlist.products = wishlist.products.filter(
      (id) => id.toString() !== productId
    );

    if (wishlist.products.length === originalLength) {
      return res.status(404).json({
        message: "Product is not in wishlist",
      });
    }

    await wishlist.save();
    await wishlist.populate("products");

    res.json({
      message: "Product removed from wishlist",
      wishlist,
    });
  } catch (error) {
    console.error("Remove wishlist error:", error);

    res.status(500).json({
      message: "Failed to remove product from wishlist",
    });
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
};