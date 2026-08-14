const joi = require("joi");

// registration validation schema
const registrationSchema = joi.object({
  name: joi.string().min(2).max(100).required(),
  email: joi.string().email().required(),
  password: joi.string().min(6).required(),
  role:joi.string().max(10).required(),
});

// login validation schema
const loginSchema = joi.object({
  email: joi.string().email().required(),
  password: joi.string().min(6).required(),
});

module.exports = {
  registrationSchema,
  loginSchema,
};