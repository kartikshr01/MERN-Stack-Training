const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      minLength: 3,
      maxLength: 30,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      min: 0,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      minLength: 2,
      maxLength: 256,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      minLength: 3,
      maxLength: 30,
      required: true,
      trim: true,
      enum: ["Electronics", "Clothing", "Books", "Home", "Sports"],
    },
    SKU: {
      type: Number,
      unique: true,
      minLength: 3,
      maxLength: 30,
      required: true,
      trim: true,
    }
  },
  {
    timestamps: true,
  },
);

const ProductModel = mongoose.model("Products", productSchema);

module.exports = ProductModel;
