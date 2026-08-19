const express = require("express");

const reviewController = require("../controller/reviewController");

const validationMiddleware = require("../middlewares/validationMiddleware");

const {
  createReviewSchema,
  getReviewsSchema,
  reviewIdSchema,
  updateReviewSchema,
} = require("../validationSchema/reviewValidationSchema");

const router = express.Router();

router.post(
  "/createReview",
  validationMiddleware(createReviewSchema),
  reviewController.createReview
);

router.get(
  "/getReviews",
  validationMiddleware(getReviewsSchema, "query"),
  reviewController.getReviews
);

router.get(
  "/getSingleReview/:id",
  validationMiddleware(reviewIdSchema, "params"),
  reviewController.getSingleReview
);

router.patch(
  "/updateReview/:id",
  validationMiddleware(reviewIdSchema, "params"),
  validationMiddleware(updateReviewSchema),
  reviewController.updateReview
);

router.delete(
  "/deleteReview/:id",
  validationMiddleware(reviewIdSchema, "params"),
  reviewController.deleteReview
);

module.exports = router;