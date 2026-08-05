const joi = require("joi");

const productValidationSchema = joi.object({
  productName: joi.string().required().min(2).max(128),
  price: joi.number().required().min(0),
  description: joi.string().required().min(2).max(128),
  category: joi.string().required().min(2).max(128),
  SKU: joi.number().required(),
});

module.exports = {
    productValidationSchema
};