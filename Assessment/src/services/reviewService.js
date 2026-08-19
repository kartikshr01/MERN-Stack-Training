const ReviewModel = require("../models/reviewModel");

const createReview = async (data) => {
  const { title, comment, rating, reviewerName } = data;

  const alreadyReviewed = await ReviewModel.findOne({
    reviewerName,
    title,
  });

  if (alreadyReviewed) {
    throw new Error("aap ye review pehle de chuke ho");
  }

  const review = await ReviewModel.create({
    title,
    comment,
    rating,
    reviewerName,
  });

  return review;
};

const getReviews = async (queryParams) => {
  const { status, minRating, page = 1, limit = 10 } = queryParams;

  const filter = {};

  if (status) {
    filter.status = status;
  }

  if (minRating) {
    filter.rating = { $gte: minRating };
  }

  const reviews = await ReviewModel.find(filter)
    .skip((page - 1) * limit)
    .limit(limit);

  return reviews;
};

const getSingleReview = async (queryParams) => {
  const { id } = queryParams;

  const review = await ReviewModel.findById(id);

  if (!review) {
    throw new Error("Review with the given ID not found.");
  }

  return review;
};

const updateReview = async (queryParams, body) => {
  const { id } = queryParams;

  const review = await ReviewModel.findById(id);

  if (!review) {
    throw new Error("Review with the provided ID not found.");
  }

  const { title, comment, rating, reviewerName } = body;

  if (title !== undefined) review.title = title;
  if (comment !== undefined) review.comment = comment;
  if (rating !== undefined) review.rating = rating;
  if (reviewerName !== undefined) review.reviewerName = reviewerName;

  await review.save();

  return review;
};

const deleteReview = async (queryParams) => {
  const { id } = queryParams;

  const review = await ReviewModel.findByIdAndDelete(id);

  if (!review) {
    throw new Error("Review with the given ID not found.");
  }

  return {
    message: "Deleted the review successfully.",
    review,
  };
};

module.exports = {
  createReview,
  getReviews,
  getSingleReview,
  updateReview,
  deleteReview,
};
