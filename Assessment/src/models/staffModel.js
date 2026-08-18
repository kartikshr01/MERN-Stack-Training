const mongoose = require("mongoose");
const { applyTimestamps } = require("./reviewModel");

const staffSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minLength: 2,
      maxLength: 50,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minLength: 6,
    },
    department: {
      type: String,
      required: true,
      enum: ["sales", "support", "warehouse"],
    },
  },
  {
    timestamps: true,
    strict: true,
  },
);

module.exports = mongoose.model("staff", staffSchema);
