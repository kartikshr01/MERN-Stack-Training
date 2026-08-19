const joi = require("joi");

const registerValiationSchema = joi
  .object({
    name: joi.string().required().min(2).max(50).trim(),
    email: joi.string().required().trim(),
    password: joi.string().required().min(6),
    department: joi.string().required().trim().valid("sales" , "support" , "warehouse"),
  })
  .options({ stripUnknown: true });

const loginValiationSchema = joi
  .object({
    email: joi.string().required().trim(),
    password: joi.string().required().min(6),
  })
  .options({ stripUnknown: true });

module.exports = {
  registerValiationSchema,
  loginValiationSchema
};
