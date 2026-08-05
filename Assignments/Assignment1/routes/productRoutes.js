const express = require("express");

const router = express.Router();

const { ProductModel } = require("../models");

const authMiddleware = require("../middleware/AuthMiddleware");
const ValidationMiddleware = require("../middleware/ValidationMiddleware");

const {
  productValidationSchema,
} = require("../validationSchema/productValidationSchema");

// Protect all product routes
router.use(authMiddleware);

// Create Product
router.post(
  "/",
  ValidationMiddleware(productValidationSchema),
  async (req, res) => {
    try {
      const { productName, price, description, SKU, category } = req.body;

      const existingProduct = await ProductModel.findOne({ SKU });

      if (existingProduct) {
        return res.status(409).json({
          message: "Product already exists",
        });
      }

      const newProduct = await ProductModel.create({
        productName,
        price,
        description,
        SKU,
        category,
      });

      res.status(201).json({
        message: "Product created successfully",
        product: newProduct,
      });
    } catch (error) {
      res.status(500).json({
        message: "Internal Server Error",
        error: error.message,
      });
    }
  },
);

// Get All Products
router.get("/", async (req, res) => {
  try {
    const products = await ProductModel.find();

    if (products.length === 0) {
      return res.status(404).json({
        message: "No products found",
      });
    }

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

// Get Product by SKU
router.get("/:sku", async (req, res) => {
  try {
    const product = await ProductModel.findOne({
      SKU: req.params.sku,
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

// Update Product
router.put(
  "/:id",
  ValidationMiddleware(productValidationSchema),
  async (req, res) => {
    try {
      const updatedProduct = await ProductModel.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        },
      );

      if (!updatedProduct) {
        return res.status(404).json({
          message: "Product not found",
        });
      }

      res.status(200).json({
        message: "Product updated successfully",
        product: updatedProduct,
      });
    } catch (error) {
      res.status(500).json({
        message: "Internal Server Error",
        error: error.message,
      });
    }
  },
);

// Delete Product
router.delete("/:id", async (req, res) => {
  try {
    const deletedProduct = await ProductModel.findByIdAndDelete(req.params.id);

    if (!deletedProduct) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.status(200).json({
      message: "Product deleted successfully",
      product: deletedProduct,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

module.exports = router;