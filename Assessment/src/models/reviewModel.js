const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: [true, "Title is required"],
      minLength: 3,
      maxLength: 80,
    },

    comment: {
      type: String,
      trim: true,
      required: [true, "Comment is required"],
      minLength: 10,
      maxLength: 500,
    },

    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: 1,
      max: 5,
      validate: {
        validator: Number.isInteger,
        message: "Rating must be a whole number",
      },
    },

    reviewerName: {
      type: String,
      trim: true,
      required: [true, "Reviewer name is required"],
      minLength: 2,
      maxLength: 50,
    },

    status: {
      type: String,
      enum: {
        values: ["pending", "approved", "rejected"],
        message: "{value} is not a valid status",
      },
      default: "pending",
    },

    isVerifiedPurchase: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    strict: true,
  },
);

module.exports = mongoose.model("review", reviewSchema);
