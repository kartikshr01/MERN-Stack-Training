const reviewService = require("../services/reviewService");

const createReview = async (req, res) => {
  try {
    const review = await reviewService.createReview(req.body);

    res.status(201).json({
      success: true,
      message: "Review created successfully",
      data: review,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

const getReviews = async (req, res) => {
  try {
    const reviews = await reviewService.getReviews(req.query);

    res.status(200).json({
      success: true,
      message: "Reviews fetched successfully",
      data: reviews,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const getSingleReview = async (req, res) => {
  try {
    const review = await reviewService.getSingleReview(req.params);

    res.status(200).json({
      success: true,
      message: "Review fetched successfully",
      data: review,
    });
  } catch (err) {
    res.status(404).json({
      success: false,
      message: err.message,
    });
  }
};

const updateReview = async (req, res) => {
  try {
    const review = await reviewService.updateReview(
      req.params,
      req.body
    );

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      data: review,
    });
  } catch (err) {
    res.status(404).json({
      success: false,
      message: err.message,
    });
  }
};

const deleteReview = async (req, res) => {
  try {
    const review = await reviewService.deleteReview(req.params);

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
      data: review,
    });
  } catch (err) {
    res.status(404).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = {
  createReview,
  getReviews,
  getSingleReview,
  updateReview,
  deleteReview,
};