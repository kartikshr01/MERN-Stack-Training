require("dotenv").config();

const jwt = require("jsonwebtoken");

const StaffModel = require("../models/staffModel");

const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No token provided.",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    const staff = await StaffModel.findById(decoded.id);

    if (!staff) {
      return res.status(401).json({
        success: false,
        message: "Staff not found.",
      });
    }

    req.user = staff;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};

module.exports = authMiddleware;