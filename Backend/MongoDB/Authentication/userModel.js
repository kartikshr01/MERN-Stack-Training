const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      minLength: 12,
      maxLength: 128,
      unique: true,
      required: true,
      trim: true,
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
    strict: true
  },
);

const UserModel = mongoose.model("Users", userSchema);

module.exports = UserModel;