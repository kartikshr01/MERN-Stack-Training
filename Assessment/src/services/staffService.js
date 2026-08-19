require("dotenv").config();

const StaffModel = require("../models/staffModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const register = async (body) => {
  const { name, email, password, department } = body;

  const existingUser = await StaffModel.findOne({ email });

  if (existingUser) {
    const error = new Error("Email already exists! Please login.");
    error.statusCode = 409;
    throw error;
  }

  const user = await StaffModel.create({
    name,
    email,
    password,
    department,
  });

  return {
    name: user.name,
    email: user.email,
    department: user.department,
  };
};

const login = async (body) => {
  const { email, password } = body;

  const existingUser = await StaffModel.findOne({ email });

  if (!existingUser) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const isPasswordCorrect = await bcrypt.compare(
    password,
    existingUser.password,
  );

  if (!isPasswordCorrect) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const secretKey = process.env.JWT_SECRET;

  const token = jwt.sign(
    {
      id: existingUser._id,
      department: existingUser.department,
    },
    secretKey,
    {
      expiresIn: "1h",
    },
  );

  return token;
};

module.exports = {
  register,
  login,
};
