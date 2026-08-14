// ============================================================================
// src/middlewares/errorHandler.js
//
// Ye poori app ka "HOSPITAL" hai. Kahin bhi error aaye, sab yahi aata hai.
//
// Pehle har controller me `try { } catch (err) { console.log(err) }` likhna
// padta tha — aur user ko koi response hi nahi jaata tha (request latak jaati thi).
// Ab ek hi jagah sab handle hai.
//
// ⚠️ server.js me ye SABSE LAST me lagana — saare routes ke BAAD.
// ============================================================================

const apiError = require("../utils/apiError");
const httpStatus = require("../utils/httpStatus");

/**
 * notFound — agar upar ka koi bhi route match nahi hua to request yahan aati hai.
 * Iske bina galat URL pe Express ka default HTML page dikhta hai (API me bekaar).
 */
const notFound = (req, res, next) => {
  next(
    apiError.createError(
      httpStatus.NOT_FOUND,
      `Route not found: ${req.method} ${req.originalUrl}`
    )
  );
};

/**
 * errorHandler — FINAL response bhejne wala middleware.
 *
 * ⚠️⚠️ 4 PARAMETERS ZAROORI HAIN (err, req, res, next).
 *      Express `function.length` dekh ke decide karta hai ki ye ERROR middleware
 *      hai ya normal middleware. 3 parameter likhoge to Express isko normal
 *      middleware samjhega aur ye kabhi chalega hi nahi.
 *      `next` use na ho tab bhi likhna padega. Ye #1 galti hai students ki.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  // Agar humne khud apiError se banaya hai to statusCode already mojood hoga.
  // Nahi to 500 maan lo.
  let statusCode = err.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
  let message = err.message || "Internal server error";
  let errors = err.errors || [];

  // ------------------------------------------------------------------------
  // Mongoose / JWT ke RAW errors ko insaan ke padhne layak banao
  //
  // Har check `err.name` ya `err.code` se ho raha hai — simple property check,
  // ------------------------------------------------------------------------

  // 1) CastError -> galat ObjectId. "abc" ko ObjectId me convert nahi kar paaya
  if (err.name === "CastError") {
    statusCode = httpStatus.BAD_REQUEST;
    message = `Invalid value for '${err.path}'`;
  }

  // 2) Mongoose schema validation fail (jaise category enum me nahi hai)
  else if (err.name === "ValidationError") {
    statusCode = httpStatus.BAD_REQUEST;
    message = "Validation failed";
    errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }

  // 3) Duplicate key -> unique index toota (humare case me SKU)
  //    ⚠️ Ye 400 NAHI, 409 CONFLICT hai. Request bilkul sahi thi,
  //    bas resource pehle se mojood hai.
  else if (err.code === 11000) {
    statusCode = httpStatus.CONFLICT;
    const field = Object.keys(err.keyValue || {})[0] || "field";
    message = `This ${field} already exists`;
  }

  // 4) JWT errors — aapke authValidation.js me jwt.verify() try/catch me nahi hai,
  //    isliye wo THROW karta hai. Wo error yahan aa ke 401 ban jaata hai.
  else if (err.name === "JsonWebTokenError") {
    statusCode = httpStatus.UNAUTHORIZED;
    message = "Invalid token, please login again";
  } else if (err.name === "TokenExpiredError") {
    statusCode = httpStatus.UNAUTHORIZED;
    message = "Token expired, please login again";
  }

  // 5) Galat JSON body bheji (express.json() se aata hai)
  else if (err.name === "SyntaxError" && "body" in err) {
    statusCode = httpStatus.BAD_REQUEST;
    message = "Invalid JSON in request body";
  }

  // ------------------------------------------------------------------------
  // Server pe log karo (developer ke liye), phir client ko response bhejo
  // ------------------------------------------------------------------------
  if (statusCode >= 500) {
    console.error(`[ERROR] ${req.method} ${req.originalUrl}`, err);
  } else {
    console.warn(`[WARN] ${req.method} ${req.originalUrl} -> ${statusCode}: ${message}`);
  }

  res.status(statusCode).json({
    success: false,
    message,
    // errors array tabhi bhejo jab kuch ho
    ...(errors.length ? { errors } : {}),
    // ⚠️ Stack trace SIRF development me. Production me isme file paths,
    //    package versions, kabhi DB structure tak leak hota hai — attacker
    //    ke liye ye free information hai.
    ...(process.env.NODE_ENV === "production" ? {} : { stack: err.stack }),
  });
};

module.exports = { notFound, errorHandler };
