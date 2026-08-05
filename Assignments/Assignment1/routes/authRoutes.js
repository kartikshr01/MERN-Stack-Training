const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const router = express.Router();

const { AuthModel } = require("../models");

const {
  registrationValidationSchema,
  loginValidationSchema,
} = require("../validationSchema/AuthValidationSchema");

const ValidationMiddleware = require("../middleware/ValidationMiddleware");

// Register
router.post(
  "/register",
  ValidationMiddleware(registrationValidationSchema),
  async (req, res) => {
    try {
      const { username, email, password } = req.body;

      const existingUser = await AuthModel.findOne({ email });

      if (existingUser) {
        return res.status(409).json({
          message: "User already exists",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await AuthModel.create({
        username,
        email,
        password: hashedPassword,
      });

      res.status(201).json({
        message: "User registered successfully",
        user: {
          username: newUser.username,
          email: newUser.email,
        },
      });
    } catch (error) {
      res.status(500).json({
        message: "Internal Server Error",
        error: error.message,
      });
    }
  },
);

// Login
router.post(
  "/login",
  ValidationMiddleware(loginValidationSchema),
  async (req, res) => {
    try {
      const { email, password } = req.body;

      const existingUser = await AuthModel.findOne({ email });

      if (!existingUser) {
        return res.status(401).json({
          message: "Invalid Email or Password",
        });
      }

      const isMatch = await bcrypt.compare(password, existingUser.password);

      if (!isMatch) {
        return res.status(401).json({
          message: "Invalid Email or Password",
        });
      }

      const token = jwt.sign(
        { id: existingUser._id },
        "TechnoDB",
        { expiresIn: "1h" },
      );

      res.cookie("token", token, {
        httpOnly: true,
        maxAge: 60 * 60 * 1000,
      });

      res.status(200).json({
        message: "Login Successful",
      });
    } catch (error) {
      res.status(500).json({
        message: "Internal Server Error",
        error: error.message,
      });
    }
  },
);

// Logout
router.post("/logout", (req, res) => {
  res.clearCookie("token");

  res.status(200).json({
    message: "Logout Successful",
  });
});

module.exports = router;