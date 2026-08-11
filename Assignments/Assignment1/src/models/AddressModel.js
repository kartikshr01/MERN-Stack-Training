const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    addressType: {
      type: String,
      enum: ["Home", "Office"],
      required: true,
      trim: true,
    },

    addressLine1: {
      type: String,
      minlength: 2,
      maxlength: 128,
      required: true,
      trim: true,
    },

    addressLine2: {
      type: String,
      minlength: 2,
      maxlength: 128,
      required: true,
      trim: true,
    },

    city: {
      type: String,
      minlength: 2,
      maxlength: 128,
      required: true,
      trim: true,
    },

    state: {
      type: String,
      minlength: 2,
      maxlength: 128,
      required: true,
      trim: true,
    },

    pincode: {
      type: String,
      required: true,
      trim: true,
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
  {
    timestamps: true,
    strict: true,
  },
);

addressSchema.index({ location: "2dsphere" });

const AddressModel = mongoose.model("Address", addressSchema);

module.exports = AddressModel;
