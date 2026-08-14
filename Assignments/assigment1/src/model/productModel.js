const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "auth",
    required: true, 
},
  name: {
    type: String,
    minLength: 2,
    maxLength: 64,
    required: true,
    trim: true,
  },
  SKU: {
    type: String,
    unique: true,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    min: 0,
    required: true,
  },
  description: {
    type: String,
    maxLength: 264,
    trim: true,
  },
    category: {
      type: String,
      enum: ["Electronics", "Clothing", "Books", "Home", "Sports"],
      required: true,
      trim: true,
      minLength: 2,
      maxLength: 64,
      required: true,
      trim: true,
    }
});



const ProductModel = mongoose.model("product", productSchema);
module.exports = ProductModel;