const Product = require("../models/Product");

// GET /api/products
const getProducts = async (req, res) => {
  try {
    const {
      category,
      metalType,
      karat,
      minWeight,
      maxWeight,
      minPrice,
      maxPrice,
      search,
    } = req.query;

    const filter = {
      isActive: true,
    };

    if (category) {
      filter.category = category;
    }

    if (metalType) {
      filter.metalType = metalType;
    }

    if (karat) {
      filter.karat = Number(karat);
    }

    if (minWeight || maxWeight) {
      filter.weight = {};

      if (minWeight) {
        filter.weight.$gte = Number(minWeight);
      }

      if (maxWeight) {
        filter.weight.$lte = Number(maxWeight);
      }
    }

    if (minPrice || maxPrice) {
      filter.price = {};

      if (minPrice) {
        filter.price.$gte = Number(minPrice);
      }

      if (maxPrice) {
        filter.price.$lte = Number(maxPrice);
      }
    }

    if (search) {
      filter.$or = [
        {
          name: {
            $regex: search,
            $options: "i",
          },
        },
        {
          description: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const products = await Product.find(filter).sort({
      createdAt: -1,
    });

    res.json({
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Get products error:", error);

    res.status(500).json({
      message: "Failed to fetch products",
    });
  }
};

// GET /api/products/:id
const getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      isActive: true,
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json(product);
  } catch (error) {
    console.error("Get product error:", error);

    res.status(500).json({
      message: "Failed to fetch product",
    });
  }
};

// POST /api/products
const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      metalType,
      karat,
      weight,
      price,
      stock,
      images,
    } = req.body;

    if (
      !name ||
      !description ||
      !category ||
      !metalType ||
      karat === undefined ||
      weight === undefined ||
      price === undefined
    ) {
      return res.status(400).json({
        message: "Required product fields are missing",
      });
    }

    const product = await Product.create({
      name,
      description,
      category,
      metalType,
      karat,
      weight,
      price,
      stock: stock || 0,
      images: images || [],
    });

    res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Create product error:", error);

    res.status(500).json({
      message: "Failed to create product",
    });
  }
};

// PUT /api/products/:id
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json({
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("Update product error:", error);

    res.status(500).json({
      message: "Failed to update product",
    });
  }
};

// DELETE /api/products/:id
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        isActive: false,
      },
      {
        new: true,
      }
    );

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete product error:", error);

    res.status(500).json({
      message: "Failed to delete product",
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};