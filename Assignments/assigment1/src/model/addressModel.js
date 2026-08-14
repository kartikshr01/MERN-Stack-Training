const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "auth",
      required: true,
    },
    type: {
      type: String,
      enum: ["Home", "Office", "Billing", "Shipping"],
      default: "Home",
    },
    street: {
      type: String,
      maxLength: 264,
      required: true,
    },
    city: {
      type: String,
      maxLength: 264,
      required: true,
    },
    state: {
      type: String,
      maxLength: 128,
      required: true,
    },
    country: {
      type: String,
      maxLength: 128,
      required: true,
    },
    pincode: {
      type: Number,
      min: 100000,
      max: 999999,
      required: true,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
  },
  { timestamps: true },
);

addressSchema.index({ location: "2dsphere" });

const AddressModel = mongoose.model("address", addressSchema);

module.exports = AddressModel;
