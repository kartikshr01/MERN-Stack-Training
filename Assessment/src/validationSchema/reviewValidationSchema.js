const joi = require("joi");

const createReviewSchema = joi
  .object({
    title: joi.string().required().min(3).max(80).trim(),
    comment: joi.string().required().min(10).max(500).trim(),
    rating: joi.number().integer().required().min(1).max(5),
    reviewerName: joi.string().required().min(2).max(50).trim(),
  })
  .options({ stripUnknown: true });

const getReviewsSchema = joi
  .object({
    status: joi.string().optional().valid("rejected", "approved", "pending"),
    minRating: joi.number().optional().min(1).max(5),
    page: joi.number().integer().optional().min(1).default(1),
    limit: joi.number().integer().optional().min(1).max(20).default(10),
  })
  .options({ stripUnknown: true });

const reviewIdSchema = joi
  .object({
    id: joi.string().length(24).hex().required(),
  })
  .options({ stripUnknown: true });

const updateReviewSchema = joi
  .object({
    title: joi.string().min(3).max(80).trim(),
    comment: joi.string().min(10).max(500).trim(),
    rating: joi.number().integer().min(1).max(5),
    reviewerName: joi.string().min(2).max(50).trim(),
  })
  .min(1)
  .options({ stripUnknown: true });

module.exports = {
  createReviewSchema,
  getReviewsSchema,
  reviewIdSchema,
  updateReviewSchema,
};
