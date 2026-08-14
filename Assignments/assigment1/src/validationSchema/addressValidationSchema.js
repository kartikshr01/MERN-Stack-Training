const joi = require("joi");

const addressValidationSchema = joi.object({
  type: joi
    .string()
    .valid("Home", "Office", "Billing", "Shipping", "home", "office", "billing", "shipping")
    .default("Home"),
  street: joi.string().trim().max(264).required(),
  city: joi.string().trim().max(264).required(),
  state: joi.string().trim().max(128).required(),
  country: joi.string().trim().max(128).required(),
  pincode: joi.number().integer().min(100000).max(999999).required(),
  latitude: joi.number().min(-90).max(90),
  longitude: joi.number().min(-180).max(180),
  location: joi.object({
    type: joi.string().valid("Point").default("Point"),
    coordinates: joi.array().items(joi.number()).length(2),
  }),
});

const nearMeValidationSchema = joi.object({
  longitude: joi.number().min(-180).max(180).required(),
  latitude: joi.number().min(-90).max(90).required(),
  radius: joi.number().positive().default(5000), // radius in meters
});

const searchAddressValidationSchema = joi.object({
  street: joi.string().trim().min(1).required(),
});

module.exports = {
  addressValidationSchema,
  nearMeValidationSchema,
  searchAddressValidationSchema,
};