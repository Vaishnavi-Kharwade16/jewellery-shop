const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      enum: [
        "Rings",
        "Necklaces",
        "Earrings",
        "Bracelets",
        "Bangles",
        "Pendants",
      ],
    },

    metalType: {
      type: String,
      required: true,
      enum: ["Gold", "Silver", "Platinum", "Rose Gold"],
    },

    karat: {
      type: Number,
      enum: [14, 18, 22, 24],
      required: true,
    },

    weight: {
      type: Number,
      required: true,
      min: 0,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    images: {
      type: [String],
      default: [],
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema);