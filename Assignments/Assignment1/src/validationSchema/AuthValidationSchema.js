const joi = require("joi");

const registrationValidationSchema = joi.object({
  username: joi.string().required().min(2).max(128),
  email: joi.string().email().required().min(2).max(128),
  password: joi.string().required().min(8).max(128),
});

const loginValidationSchema = joi.object({
  email: joi.string().required(),
  password: joi.string().required(),
});

module.exports = {
  registrationValidationSchema,
  loginValidationSchema,
};