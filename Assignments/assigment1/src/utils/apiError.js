// ============================================================================
// src/utils/apiError.js
//
// Kaam: aisa error banana jisme HTTP statusCode bhi ho.
//
// Problem: normal `new Error("product not found")` me sirf message hota hai.
//          Error handler ko kaise pata chalega ki 404 bhejna hai ya 500?
//
// Solution: Error banao aur usme apni properties laga do. Bas itna hi.
//           (class / extends / super ki koi zaroorat nahi — simple function kaafi hai.)
// ============================================================================

/**
 * createError — error banane wala main function
 *
 * @param {number} statusCode - 400, 404, 409...
 * @param {string} message    - user ko dikhne wala message
 * @param {Array}  errors     - field-wise validation errors (optional)
 * @returns {Error}
 */
const createError = (statusCode, message, errors = []) => {
  // ⚠️ `new Error()` use kar rahe hain, plain object `{}` nahi. KYUN?
  //    Error ke saath STACK TRACE apne aap milta hai — matlab galti kis file ki
  //    kis line pe hui, wo pata chalta hai. Plain object throw karoge to
  //    ye information bilkul nahi milegi aur debugging narak ban jaayegi.
  const error = new Error(message);

  // JavaScript me kisi bhi object pe kabhi bhi nayi property laga sakte ho.
  // Error bhi ek object hi hai — to usme statusCode chipka do.
  error.statusCode = statusCode;
  error.errors = errors;

  // isOperational = true matlab: ye EXPECTED error hai (user ki galti).
  // false hota to matlab humara code phata hai (bug).
  error.isOperational = true;

  return error;
};

// ---------------------------------------------------------------------------
// SHORTCUTS — har jagah createError(404, "Product not found") likhna boring hai.
//
// `= "Resource"` ye DEFAULT PARAMETER hai. Agar kuch na bhejo to "Resource" le lega.
// ---------------------------------------------------------------------------

const badRequest = (message = "Bad request", errors = []) => createError(400, message, errors);

const unauthorized = (message = "Please login first") => createError(401, message);

const forbidden = (message = "You are not allowed to perform this action") =>
  createError(403, message);

const notFound = (resource = "Resource") => createError(404, `${resource} not found`);

const conflict = (message = "Already exists") => createError(409, message);

module.exports = {
  createError,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  conflict,
};

// ============================================================================
// USE KAISE KARNA HAI:
//
//   const apiError = require("../utils/apiError");
//
//   throw apiError.notFound("Product");
//   throw apiError.conflict("SKU already exists");
//   throw apiError.createError(404, "Route not found: GET /xyz");   // custom message
//
// `new` lagane ki zaroorat NAHI hai — ye normal functions hain.
// ============================================================================
