// ============================================================================
// src/validationSchema/productValidationSchema.js
//
// VALIDATION LAYER ka kaam: "Ganda data andar aane hi mat do."
//
// ⚠️ Yahan SIRF wahi 5 fields hain jo aapke productModel.js me hain:
//    name, SKU, price, description, category
//    Koi naya field ADD nahi kiya gaya.
//
// Sawaal: Mongoose me already validation hai, phir Joi kyun?
// Jawaab:
//   1. Joi request ko DB tak pahunchne se PEHLE rok deta hai -> DB call bachi
//   2. Joi query aur params bhi validate karta hai — Mongoose sirf document
//   3. stripUnknown se extra fields hat jaate hain (mass assignment se bachaav)
//   4. Error messages field-wise aur saaf milte hain
//   Dono chahiye: Joi = gate ka guard, Mongoose = ghar ka lock.
// ============================================================================

const joi = require("joi");

// ---------------------------------------------------------------------------
// Ye values HUBAHU aapke productModel.js ke enum se copy ki hain.
// Ek jagah likh ke reuse (DRY) — kal enum badla to sirf yahan badlega.
// ---------------------------------------------------------------------------
const CATEGORIES = ["Electronics", "Clothing", "Books", "Home", "Sports"];

// MongoDB ObjectId hamesha 24 character ka HEXADECIMAL string hota hai.
// Ye check yahan karne se galat ID pe DB call jaayegi hi nahi.
const objectId = joi
  .string()
  .pattern(/^[0-9a-fA-F]{24}$/)
  .messages({ "string.pattern.base": "{#label} must be a valid MongoDB ObjectId" });

// Pagination har list API me same hai — ek baar likha, sab jagah reuse
const pagination = {
  page: joi.number().integer().min(1).default(1),

  // ⚠️ max(100) SABSE IMPORTANT line hai is file me.
  //    Iske bina user ?limit=99999999 bhej ke poora DB ek request me
  //    kheech lega -> server ki memory bhar jaayegi -> CRASH.
  //    Ye ek asli DoS (Denial of Service) vector hai.
  limit: joi.number().integer().min(1).max(100).default(10),
};

// Sort SIRF in fields pe allow hai (whitelist).
// ⚠️ createdAt yahan NAHI hai kyunki aapke schema me timestamps: true nahi hai.
const sortBy = joi
  .string()
  .pattern(/^(name|price|category):(asc|desc)(,(name|price|category):(asc|desc))*$/)
  .messages({
    "string.pattern.base":
      'sortBy must look like "price:asc" or "category:asc,price:desc" (allowed: name, price, category)',
  });

// ============================================================================
// 1) CREATE PRODUCT  ->  POST /products/createProduct   (body)
// ============================================================================
const createProductSchema = joi.object({
  // Har rule HUBAHU model se match: minLength 2, maxLength 64
  name: joi.string().trim().min(2).max(64).required(),
  owner: joi.string().trim().min(2).max(64).required(),
  SKU: joi.string().trim().min(1).max(64).required(),

  // model me min: 0 hai, isliye yahan bhi min(0).
  // (Purane Joi schema me min(1) tha — wo model se match nahi karta tha.)
  price: joi.number().min(0).required(),

  // model me maxLength: 264 hai. (Purane Joi schema me 256 tha — 8 ka farq.
  // Matlab 260 character wali description Joi se nikal jaati aur Mongoose pe
  // ja ke fail hoti. Ab dono same hain.)
  description: joi.string().trim().max(264).allow(""),

  // ⭐ valid(...CATEGORIES) purane schema me nahi tha.
  //    Pehle koi bhi string chal jaati thi aur error Mongoose se raw form me
  //    aata tha. Ab Joi hi saaf message ke saath rok deta hai.
  category: joi
    .string()
    .trim()
    .valid(...CATEGORIES)
    .required()
    .messages({ "any.only": `category must be one of: ${CATEGORIES.join(", ")}` }),
});

// ============================================================================
// 2) GET ALL PRODUCTS  ->  GET /products/getAllProducts   (query)
// ============================================================================
const getAllProductsSchema = joi.object({
  category: joi.string().trim().valid(...CATEGORIES),
  minPrice: joi.number().min(0),

  // joi.ref("minPrice") = "usi object ki dusri field ko dekho".
  // Matlab maxPrice hamesha minPrice se bada hona chahiye. (Cross-field validation)
  maxPrice: joi.number().min(0).greater(joi.ref("minPrice")).messages({
    "number.greater": "maxPrice must be greater than minPrice",
  }),
  sortBy,
  ...pagination,
});

// ============================================================================
// 3) SEARCH PRODUCTS  ->  GET /products/searchProducts   (query)   ⭐ NAYI API
// ============================================================================
const searchProductSchema = joi.object({
  // q = search keyword.
  // max(80) kyun? Bahut lambi query ka regex banana slow hota hai.
  q: joi.string().trim().min(1).max(80).required().messages({
    "any.required": "Search keyword (q) is required",
    "string.empty": "Search keyword cannot be empty",
  }),

  // Search ke saath filter bhi chalega
  category: joi.string().trim().valid(...CATEGORIES),
  minPrice: joi.number().min(0),
  maxPrice: joi.number().min(0).greater(joi.ref("minPrice")).messages({
    "number.greater": "maxPrice must be greater than minPrice",
  }),
  sortBy,
  ...pagination,
});

// ============================================================================
// 4) GET / UPDATE / DELETE ke liye :id   (params)
// ============================================================================
const productIdSchema = joi.object({
  id: objectId.required(),
});

// ============================================================================
// 5) UPDATE PRODUCT  ->  PATCH /products/updateSingleProduct/:id   (body)
// ============================================================================
const updateProductSchema = joi
  .object({
    // Yahan koi field .required() NAHI hai — PATCH partial update hai,
    // user jo bheje sirf wahi badlega.
    name: joi.string().trim().min(2).max(64),
    SKU: joi.string().trim().min(1).max(64),
    price: joi.number().min(0),
    description: joi.string().trim().max(264).allow(""),
    category: joi
      .string()
      .trim()
      .valid(...CATEGORIES),
  })
  // .min(1) object pe = "kam se kam 1 key honi chahiye".
  // Iske bina user PATCH {} bhejta rahega aur hum bekaar DB write karenge.
  .min(1)
  .messages({ "object.min": "At least one field is required to update" });

module.exports = {
  // ⚠️ Purana naam bhi rakha hai taaki kahin `validationProductSchema` import
  //    ho raha ho to code na toote (backward compatibility).
  validationProductSchema: createProductSchema,

  createProductSchema,
  getAllProductsSchema,
  searchProductSchema,
  productIdSchema,
  updateProductSchema,
  CATEGORIES,
};
