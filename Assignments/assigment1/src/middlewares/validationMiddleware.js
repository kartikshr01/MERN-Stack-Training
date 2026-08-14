// ============================================================================
// src/middlewares/validationMiddleware.js
//
// PEHLE ye sirf req.body validate karta tha. Ab ye body / query / params
// TEENO validate kar sakta hai.
//
// Purana code TOOTA NAHI hai:
//   validationMiddleware(registrationSchema)           -> body  (default, pehle jaisa)
//   validationMiddleware(searchSchema, "query")        -> query params
//   validationMiddleware(idSchema, "params")           -> URL params
//
// Kyun zaroorat padi: search API me data QUERY me aata hai (?q=laptop&page=1),
// body me nahi. Purana middleware query ko chhoo hi nahi sakta tha.
// ============================================================================

const apiError = require("../utils/apiError");

/**
 * @param {Object} schema   - Joi schema
 * @param {string} property - "body" | "query" | "params"  (default: "body")
 */
const validationMiddleware = (schema, property = "body") => {
  // Ye ek function RETURN kar raha hai — isko "currying" kehte hain.
  // Isi wajah se route me `validationMiddleware(schema)` likh paate hain.
  return (req, res, next) => {
    const { value, error } = schema.validate(req[property], {
      abortEarly: false,  // SAARI galtiyan ek saath batao, pehli pe ruko mat
      stripUnknown: true, // schema me jo field nahi hai use CHUP-CHAAP hata do
      convert: true,      // "10" (string) -> 10 (number). Query params hamesha string hote hain
    });

    if (error) {
      // error.details ek ARRAY hai — har fail hui field ka apna object
      const errors = error.details.map((detail) => ({
        field: detail.path.join("."),          // ['price'] -> "price"
        message: detail.message.replace(/"/g, ""), // extra quotes hata do
      }));

      // throw nahi, next(error) — taaki global error handler tak pahunche
      return next(apiError.badRequest("Validation failed", errors));
    }

    // SAAF data wapas request pe rakh do. Ab controller me jo aayega wo
    // GUARANTEED valid + sahi type ka hoga.
    if (property === "query") {
      // ⚠️ EXPRESS 5 GOTCHA: yahan `req.query = value` likhoge to app CRASH hogi
      //    ("Cannot set property query of #<IncomingMessage> which has only a getter")
      //    Express 5 me req.query sirf GETTER hai. Isliye defineProperty use karte hain.
      //    Express 4 me bhi ye chalta hai, isliye ye tarika safe hai.
      Object.defineProperty(req, "query", {
        value,
        writable: true,
        configurable: true,
        enumerable: true,
      });
    } else {
      req[property] = value;
    }

    next();
  };
};

module.exports = validationMiddleware;
