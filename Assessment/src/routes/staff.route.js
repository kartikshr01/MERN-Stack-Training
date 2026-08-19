const express = require("express");

const router = express.Router();

const staffController = require("../controllers/staffController");

const validationMiddleware = require("../middlewares/validationMiddleware");

const authMiddleware = require("../middlewares/authMiddleware");

const staffValidationSchema = require("../validationSchema/staffValidationSchema");

router.post(
  "/register",
  validationMiddleware(staffValidationSchema.registerValiationSchema),
  staffController.register
);

router.post(
  "/login",
  validationMiddleware(staffValidationSchema.loginValiationSchema),
  staffController.login
);

router.get(
  "/me",
  authMiddleware,
  staffController.me
);

module.exports = router;