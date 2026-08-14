// ============================================================================
// server.js  —  ENTRY POINT (npm run dev isi file ko chalata hai)
//
// Kaam: middlewares lagao -> routes lagao -> error handlers lagao -> DB connect -> listen
// ============================================================================

const express = require("express");
const cookieParser = require("cookie-parser");

const connectDB = require("./src/config/db");
const authRouter = require("./src/routes/auth.route");
const productRouter = require("./src/routes/product.route");
const addressRouter = require("./src/routes/address.route");

// ⭐ NAYA: global error handler + 404 handler
const { notFound, errorHandler } = require("./src/middlewares/errorHandler");

const app = express();

// ---------------------------------------------------------------------------
// GLOBAL MIDDLEWARES
// ⚠️ ORDER IMPORTANT HAI. Ye upar se neeche chalte hain.
// ---------------------------------------------------------------------------
app.use(cookieParser());        // cookie string -> req.cookies object (token yahan se milta hai)
app.use(express.json());        // raw JSON bytes -> req.body object

// ⚠️ express.json() se PEHLE req.body UNDEFINED hota hai. Isliye ye routes se upar hai.

// ---------------------------------------------------------------------------
// ROUTES
// ---------------------------------------------------------------------------
app.use("/auth", authRouter);
app.use("/products", productRouter);
app.use("/address", addressRouter);

// ---------------------------------------------------------------------------
// ERROR HANDLING  —  ⚠️ HAMESHA SABSE LAST ME, saare routes ke BAAD
//
// Agar inhe routes se PEHLE laga doge to ye kabhi chalenge hi nahi
// (kyunki koi route pehle hi response bhej dega). Ye #1 galti hai.
// ---------------------------------------------------------------------------
app.use(notFound);       // koi route match nahi hua -> 404 JSON
app.use(errorHandler);   // har error -> ek jaisa JSON response

// ---------------------------------------------------------------------------
// DB CONNECT -> PHIR SERVER START
//
// Pehle DB, phir listen. Ulta kiya to server chalu ho jaayega aur pehli
// request DB error degi — user ko 500 milega jabki asli problem startup ki thi.
// ---------------------------------------------------------------------------
connectDB()
  .then(() => {
    app.listen(3000, () => {
      console.log("server starts on port 3000");
    });
  })
  .catch((err) => {
    console.log("database connection error", err);
  });
