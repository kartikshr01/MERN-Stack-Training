const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

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

staffSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("staff", staffSchema);
