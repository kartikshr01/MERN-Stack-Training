const express = require("express");

const reviewController = require("../controller/reviewController");
const validationMiddleware = require("../middlewares/validationMiddleware");

const {
  createReviewSchema,
  getReviewsSchema,
} = require("../validationSchema/reviewValidationSchema");

const router = express.Router();

router.post(
  "/createReview",
  validationMiddleware(createReviewSchema),
  reviewController.createReview,
);

router.get(
  "/getReviews",
  validationMiddleware(getReviewsSchema, "query"),
  reviewController.getReviews,
);

module.exports = router;
