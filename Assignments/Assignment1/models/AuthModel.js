const mongoose = require("mongoose");

const authSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      minLength: 2,
      maxLength: 128,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      minLength: 12,
      maxLength: 128,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      minLength: 8,
      maxLength: 128,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    strict: true,
  },
);

const AuthModel = mongoose.model("Credentials", authSchema);

module.exports = AuthModel;
