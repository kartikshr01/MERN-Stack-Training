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
  const { status, page = 1, limit = 10 } = queryParams;

  const filter = {};

  if (status) {
    filter.status = status;
  }

  const reviews = await ReviewModel.find(filter)
    .skip((page - 1) * limit)
    .limit(limit);

  return reviews;
};

module.exports = {
  createReview,
  getReviews,
};
