// ============================================================================
// src/routes/product.route.js
//
// ROUTE LAYER = TRAFFIC POLICE 🚦
//
// Iska kaam SIRF itna: "kaunsa URL + method aaye to kaunsi middleware chain chale"
// Yahan koi logic NAHI likhna.
// (Pehle getAllProducts ka poora DB code isi file me pada tha — ab wo service me hai.)
//
// Middleware chain LEFT se RIGHT chalti hai:
//   authMiddleware -> authorization -> validationMiddleware -> controller
//   (kaun ho?)        (allowed ho?)    (data sahi hai?)        (ab kaam karo)
//
// Koi bhi step fail hua -> next(error) -> baaki sab SKIP -> seedha errorHandler.
// ============================================================================

const express = require("express");
const productRouter = express.Router();

const productController = require("../controller/productController");
const validationMiddleware = require("../middlewares/validationMiddleware");
const authMiddleware = require("../middlewares/authValidation");
const authorization = require("../middlewares/authorization");

const {
  createProductSchema,
  getAllProductsSchema,
  searchProductSchema,
  productIdSchema,
  updateProductSchema,
} = require("../validationSchema/productValidationSchema");

// ============================================================================
// 1) CREATE  ->  POST /products/createProduct
// ============================================================================
productRouter.post(
  "/createProduct",
  authMiddleware,                              // 1. Token valid hai?   fail -> 401
  authorization("admin", "seller"),            // 2. Role allowed hai?  fail -> 403
  validationMiddleware(createProductSchema),   // 3. Body sahi hai?     fail -> 400
  productController.createProduct              // 4. Ab kaam karo
);



// ============================================================================
// 2) GET ALL  ->  GET /products/getAllProducts?category=Books&page=1&limit=10
// ============================================================================
productRouter.get(
  "/getAllProducts",
  authMiddleware,
  authorization("admin", "seller", "user"),
  // ⬇ dhyaan do: dusra argument "query" hai, "body" nahi.
  //   List/search APIs me data QUERY STRING me aata hai.
  validationMiddleware(getAllProductsSchema, "query"),
  productController.getAllProducts
);

// ============================================================================
// 3) SEARCH  ->  GET /products/searchProducts?q=laptop        ⭐ NAYI API
// ============================================================================
productRouter.get(
  "/searchProducts",
  authMiddleware,
  authorization("admin", "seller", "user"),
  validationMiddleware(searchProductSchema, "query"),
  productController.searchProducts
);

// ============================================================================
// 4) GET ONE  ->  GET /products/getSingleProduct/:id
// ============================================================================
productRouter.get(
  "/getSingleProduct/:id",
  authMiddleware,
  authorization("admin", "seller", "user"),
  validationMiddleware(productIdSchema, "params"), // ObjectId format check
  productController.getSingleProduct
);

// ============================================================================
// 5) UPDATE  ->  PATCH /products/updateSingleProduct/:id
//
// PATCH use kiya, PUT nahi:
//   PATCH = PARTIAL update  -> jo bheja sirf wahi badlega
//   PUT   = POORA replace   -> jo field nahi bheji wo UD JAAYEGI
// Real apps me 99% cases me PATCH hi sahi hota hai.
// ============================================================================
productRouter.patch(
  "/updateSingleProduct/:id",
  authMiddleware,
  authorization("admin", "seller"),
  validationMiddleware(productIdSchema, "params"),
  validationMiddleware(updateProductSchema),        // body (default)
  productController.updateSingleProduct
);

// ⬆ Ek route pe DO validationMiddleware lag sakte hain — ek params ke liye,
//   ek body ke liye. Middleware chain me kitne bhi step ho sakte hain.

// ============================================================================
// 6) DELETE  ->  DELETE /products/deleteProduct/:id
// ============================================================================
productRouter.delete(
  "/deleteProduct/:id",
  authMiddleware,
  authorization("admin"), // sirf admin — delete sabse khatarnak operation hai
  validationMiddleware(productIdSchema, "params"),
  productController.deleteProduct
);

module.exports = productRouter;

// ============================================================================


// Express routes ko UPAR SE NEECHE match karta hai. PEHLA match jeet jaata hai.
//
// Humare naam verb-style hain (/searchProducts, /getSingleProduct/:id) isliye
// koi clash nahi ho raha. LEKIN agar aap REST style pe jaate:
//
//     productRouter.get("/:id", ...);       // ⬅ ye pehle likh diya
//     productRouter.get("/search", ...);    // ⬅ ye KABHI nahi chalega
//
// to /products/search hit karne pe Express samajhta ki id = "search",
// aur "Invalid ObjectId" 400 error aata. Student ghanton debug karta hai
// ki controller chal kyun nahi raha — kyunki DUSRA route match ho gaya!
//
// RULE: SPECIFIC routes hamesha DYNAMIC (:param) routes se PEHLE likho.
// ============================================================================
