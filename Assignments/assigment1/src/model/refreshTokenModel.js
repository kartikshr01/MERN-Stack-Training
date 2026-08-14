const mongoose = require("mongoose");
const { applyTimestamps } = require("./addressModel");

const refreshSchema = mongoose.Schema(
  {
    refreshToken: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "auth",
    },
    expiredAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
    strict: true
  },
);

const refreshTokenModel = mongoose.Model("refreshTokens", refreshSchema); 

module.exports = refreshTokenModel;