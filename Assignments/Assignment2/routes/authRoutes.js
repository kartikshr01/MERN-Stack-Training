const express = require("express");

const router = express.Router();

const ValidationMiddleware = require("../middleware/ValidationMiddleware");

const {
  registrationValidationSchema,
  loginValidationSchema,
} = require("../validationSchema/AuthValidationSchema");

const {
  register,
  login,
  logout,
} = require("../controllers/authController");

router.post(
  "/register",
  ValidationMiddleware(registrationValidationSchema),
  register
);

router.post(
  "/login",
  ValidationMiddleware(loginValidationSchema),
  login
);

router.post("/logout", logout);

module.exports = router;