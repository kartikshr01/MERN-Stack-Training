// ============================================================================
// src/routes/auth.route.js
//
// AUTH ke routes. server.js me `app.use("/auth", authRouter)` laga hai,
// isliye yahan ka "/register" asal me "/auth/register" banta hai.
// ============================================================================

const validationMiddleware = require("../middlewares/validationMiddleware");

// ⚠️ bcrypt aur jwt yahan ab USE NAHI HO RAHE.
//    Ye tab lage the jab poora login ka code isi route file me likha tha.
//    Ab wo logic authService me chala gaya hai. Inhe hata sakte ho —
//    unused imports confusing hote hain (naya banda sochega yahan bcrypt
//    ka kuch kaam ho raha hai).
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { registrationSchema, loginSchema } = require("../validationSchema/authValidationSchema");

// model/index.js se import — wahan saare models ek jagah export kiye hue hain,
// isliye `require("../model")` likh ke destructure kar sakte hain.
const { AuthModel } = require("../model");

// ⚠️ secretKey bhi ab yahan use nahi ho rahi — authService use karti hai.
const secretKey = process.env.secret_key;

const authController = require("../controller/authController");

// ⚠️ typo: "exppress" (do p) — chalega to sahi, par naam theek kar lena
const exppress = require("express");

// ⚠️ authMiddleware bhi yahan use nahi ho raha.
//    (Waise getUserData route pe ye lagna CHAHIYE — neeche note dekho.)
const authMiddleware = require("../middlewares/authValidation");

// Router = mini-Express app. Isi pe routes lagate hain, phir poora router
// server.js me ek prefix ke neeche mount kar dete hain.
const authRouter = exppress.Router();

// ============================================================================
// REGISTER  ->  POST /auth/register
//
// Chain: validation -> controller
// Yahan authMiddleware NAHI hai — obvious hai, register karne wale ke paas
// abhi token hoga hi nahi. Ye ek PUBLIC route hai.
// ============================================================================
authRouter.post(
  "/register",
  validationMiddleware(registrationSchema), // body check (default "body" hai)
  authController.registerUser
);

// ============================================================================
// LOGIN  ->  POST /auth/login
//
// POST kyun, GET nahi? Kyunki password bhej rahe hain. GET me data URL me
// jaata hai -> browser history, server logs, aur proxy sab me password
// likha reh jaata hai. POST me body me jaata hai.
// ============================================================================
authRouter.post("/login", validationMiddleware(loginSchema), authController.loginUser);

// ============================================================================
// LOGOUT  ->  POST /auth/logout
//
// Yahan koi validation nahi — body me kuch bhejna hi nahi hai, bas cookie hatani hai.
// ============================================================================
authRouter.post("/logout", authController.logoutUser);

// ============================================================================
// GET USER DATA  ->  GET /auth/getUserData/:id
//
// ⚠️ Ye route abhi bhi PURANE style me hai — poora logic yahin likha hua hai.
//    Product APIs ki tarah isko bhi todna chahiye:
//    route -> validation(params) -> authMiddleware -> controller -> service
//
// ⚠️ 3 aur problems:
//    1. Koi authMiddleware NAHI — matlab bina login ke koi bhi kisi ka bhi
//       data dekh sakta hai, sirf id daal ke. Ye IDOR bug hai.
//    2. `password` response me chala jaayega (authModel me select: false nahi hai).
//       Hash hai to bhi bhejna nahi chahiye.
//    3. Galat id daalne pe CastError aayega aur `res.send(err)` poora Mongoose
//       error client ko bhej dega — DB structure leak.
// ============================================================================
authRouter.get("/getUserData/:id", async (req, res) => {
  try {
    // .populate("addresses") — "addresses" authModel ka VIRTUAL field hai:
    //     authSchema.virtual("addresses", { ref: "address",
    //                                       localField: "_id",
    //                                       foreignField: "user" })
    // Matlab: address collection me jaake wo saare address dhoondho jinka
    // `user` field is user ki _id se match karta hai.
    //
    // 💡 Ye REVERSE POPULATE hai — user ke andar addresses ki list store nahi
    //    ki (warna array badhta hi jaata), balki address ke andar user ki id
    //    rakhi. Virtual se dono taraf se access mil jaata hai.
    //    Ye "one-to-many" relation ka standard tarika hai.
    let userData = await AuthModel.findById(req.params.id).populate("addresses");
    res.send(userData);
  } catch (err) {
    res.send(err);
  }
});

module.exports = authRouter;

// ============================================================================
