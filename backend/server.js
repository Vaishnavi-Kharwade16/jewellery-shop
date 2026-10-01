require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const cartRoutes = require("./routes/cart");
const wishlistRoutes = require("./routes/wishlist");
const orderRoutes = require("./routes/order");
const adminOrderRoutes = require("./routes/adminOrder");
const paymentRoutes = require("./routes/payment");
const reviewRoutes = require("./routes/reviews");

const {
  startReservationCleanup,
} = require("./services/reservationService");

const app = express();

const PORT = process.env.PORT || 5000;

// --------------------------------------------------
// Middleware
// --------------------------------------------------

app.use(cors());
app.use(express.json());

// Serve uploaded files
app.use(
  "/uploads",
  express.static("uploads")
);

// --------------------------------------------------
// Test route
// --------------------------------------------------

app.get("/", (req, res) => {
  res.json({
    message: "Jewellery Shop API is running",
  });
});

// --------------------------------------------------
// API routes
// --------------------------------------------------

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin/orders", adminOrderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/reviews", reviewRoutes);

// --------------------------------------------------
// Start server
// --------------------------------------------------

const startServer = async () => {
  try {
    await connectDB();

    console.log("MongoDB connected successfully");

    // Start expired stock-reservation cleanup
    startReservationCleanup();

    app.listen(PORT, () => {
      console.log(
        `Server running on port ${PORT}`
      );
    });
  } catch (error) {
    console.error(
      "Failed to start server:",
      error
    );

    process.exit(1);
  }
};

startServer();