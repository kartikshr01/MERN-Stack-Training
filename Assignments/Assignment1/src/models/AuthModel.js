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
    role: {
      type: String,
      enum: ["user","seller","admin"],
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

authSchema.virtual("address",{
  ref:"Address",
  localField: "_id",
  foreignField: "user"
});

authSchema.set("toJSON", {
  virtuals: true,
});

authSchema.set("toObject", {
  virtuals: true,
})

const AuthModel = mongoose.model("Credentials", authSchema);

module.exports = AuthModel;
