const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { AuthModel } = require("../models");

const registerUser = async ({ username, role, email, password }) => {
  const existingUser = await AuthModel.findOne({ email });

  if (existingUser) {
    throw new Error("USER_ALREADY_EXISTS");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await AuthModel.create({
    username,
    role,
    email,
    password: hashedPassword,
  });

  return newUser;
};

const loginUser = async ({ email, password }) => {
  const existingUser = await AuthModel.findOne({ email });

  if (!existingUser) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const isMatch = await bcrypt.compare(password, existingUser.password);

  if (!isMatch) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const token = jwt.sign(
    { id: existingUser._id },
    "TechnoDB",
    { expiresIn: "1h" }
  );

  return token;
};

module.exports = {
  registerUser,
  loginUser,
};
