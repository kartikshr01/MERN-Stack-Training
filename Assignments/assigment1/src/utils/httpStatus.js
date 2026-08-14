// ============================================================================
// src/utils/httpStatus.js
//
// Kaam: HTTP status codes ke naam wale constants.
//
// Kyun: `res.status(404)` — 404 ek NUMBER hai, padhne me kuch pata nahi chalta.
//       `res.status(httpStatus.NOT_FOUND)` — ENGLISH hai, code khud bolta hai.
//
// Bonus: 404 ki jagah galti se 400 likh doge to koi nahi rokega.
//        NOT_FOUND galat spelling likhoge to `undefined` aayega aur turant pakda jaayega.
// ============================================================================

module.exports = {
  // ---- 2xx : Sab theek ----
  OK: 200,           // GET / PATCH / DELETE safal
  CREATED: 201,      // POST safal — nayi cheez ban gayi

  // ---- 4xx : Client (user) ki galti ----
  BAD_REQUEST: 400,  // Validation fail, galat input
  UNAUTHORIZED: 401, // Token nahi hai / galat hai / expire ho gaya
  FORBIDDEN: 403,    // Token sahi hai PAR permission nahi
  NOT_FOUND: 404,    // Product/route exist hi nahi karta
  CONFLICT: 409,     // Duplicate — jaise SKU pehle se hai

  // ---- 5xx : Server (humari) ki galti ----
  INTERNAL_SERVER_ERROR: 500,
};
