// ============================================================================
// src/middlewares/authValidation.js
//
// AUTHENTICATION middleware  =  "TUM KAUN HO?"
//
// Iska kaam: cookie se token nikalo -> verify karo -> DB se user laao ->
//            `req.user` me rakh do -> aage jaane do.
//
// Iske BAAD `authorization.js` chalta hai jo poochta hai "TUMHE PERMISSION HAI?"
//
//   authValidation  -> AUTHENTICATION -> fail -> 401
//   authorization   -> AUTHORIZATION  -> fail -> 403
//
// Dono alag cheezein hain, confuse mat karna.
// ============================================================================

// jsonwebtoken = token banane (sign) aur verify karne wali library
const jwt = require("jsonwebtoken");

// .env se secret key uthai. YAHI key se login ke waqt token sign hua tha.
// Agar ye key badal do to purane saare token invalid ho jaayenge (sabko dobara login).
//
// ⚠️ Ye line file LOAD hote hi chalti hai (module top-level), request ke waqt nahi.
//    Matlab is file ke require hone se PEHLE dotenv config ho chuka hona chahiye.
//    Humare server.js me `config/db` sabse upar require hota hai aur wahi
//    `require("dotenv").config()` call karta hai — isliye ye kaam kar jaata hai.
let secretKey = process.env.secret_key;

// User model — token se mili id se asli user DB se laane ke liye
const AuthModel = require("../model/authModel");

/**
 * authMiddleware — har PROTECTED route pe sabse pehle yahi chalta hai.
 */
const authMiddleware = async (req, res, next) => {
  // ---------------------------------------------------------------------
  // STEP 1: Cookie me se token nikalo
  //
  // Login ke waqt authController me ye kiya tha:
  //     res.cookie("token", token, { httpOnly: true })
  // Browser us cookie ko har request ke saath apne aap bhejta hai.
  //
  // ⚠️ `req.cookies` tabhi exist karta hai jab server.js me `cookieParser()`
  //    laga ho. Wo nahi lagaya to yahan "Cannot read properties of undefined"
  //    crash aayega.
  //
  // 💡 httpOnly: true ka matlab — JavaScript (document.cookie) is cookie ko
  //    padh hi nahi sakta. Isse XSS attack me token chori nahi ho sakta.
  //    Isiliye token localStorage me rakhne se cookie behtar hai.
  // ---------------------------------------------------------------------
  const token = req.cookies.token;

  // Token hai hi nahi = banda logged in hi nahi hai -> 401
  // (`return` lagana ZAROORI hai, warna neeche ka code bhi chal jaayega)
  if (!token) {
    return res.status(401).send("Access denied. No token provided.");
  }

  // ---------------------------------------------------------------------
  // STEP 2: Token verify karo
  //
  // jwt.verify() do kaam karta hai:
  //   a) SIGNATURE check — token se chhed-chhaad to nahi hui? Koi apna
  //      banaya hua nakli token to nahi bhej raha?
  //   b) EXPIRY check — login ke waqt `expiresIn: "1h"` diya tha, wo nikal to nahi gaya?
  //
  // Safal hone pe wo PAYLOAD wapas karta hai — wahi jo sign karte waqt daala tha:
  //     jwt.sign({ id: userExist._id }, secretKey, { expiresIn: "1h" })
  //     -> decoded = { id: "68a1...", iat: 1699999999, exp: 1700003599 }
  //     iat = issued at (kab bana), exp = expiry (kab marega)
  //
  // ⚠️ IMPORTANT: fail hone pe jwt.verify() `null` RETURN nahi karta —
  //    wo ERROR THROW karta hai. Do tarah ke error aate hain:
  //      JsonWebTokenError  -> token galat/nakli hai
  //      TokenExpiredError  -> token purana ho gaya
  //    Ye throw seedha global errorHandler tak pahunch jaata hai (Express 5
  //    async errors khud forward karta hai), jahan dono 401 ban jaate hain.
  // ---------------------------------------------------------------------
  const decoded = jwt.verify(token, secretKey);

  // ⚠️ Ye check practically kabhi chalta hi nahi — upar wali line fail hone pe
  //    throw kar deti hai, yahan tak pahunchti hi nahi. Safety net ke taur pe
  //    rakha hai. (Aur agar chal bhi jaaye to 400 nahi, 401 hona chahiye.)
  if (!decoded) {
    return res.status(400).send("please login again.");
  }

  // ⚠️ Ye DEBUG log hai. Har request pe user id terminal me print hoti hai.
  //    Production me isko hata dena — log file bhar jaayegi aur user ki id
  //    plain text me logs me padi rahegi.
  console.log("decoded", decoded);

  // ---------------------------------------------------------------------
  // STEP 3: DB se FRESH user laao
  //
  // Sawaal: token me id to hai hi, phir DB call kyun? Ek extra query kyun?
  //
  // Jawaab: token VALID hone ka matlab ye NAHI ki user abhi bhi exist karta hai.
  //   - User ka account delete ho gaya ho sakta hai
  //   - Admin ne use ban kar diya ho sakta hai
  //   - Uska role "user" se "admin" (ya ulta) badla ho sakta hai
  //   ...aur uska 1 ghante wala token abhi bhi valid hai!
  //
  // Token ek "purana photo" hai, DB "aaj ki asliyat". Isliye har request pe
  // fresh user uthate hain.
  //
  // `decoded.id` isliye kyunki login me `jwt.sign({ id: userExist._id }, ...)`
  // likha tha. Agar wahan `{ userId: ... }` likha hota to yahan `decoded.userId` hota.
  // ---------------------------------------------------------------------
  const userData = await AuthModel.findById(decoded.id);

  // req.user set kar diya — ab AAGE ka har middleware aur controller isko
  // use kar sakta hai:
  //   authorization.js  -> req.user.role check karta hai
  //   controller        -> req.user._id se pata chalta hai kisne request bheji
  //
  // ⚠️ Agar user delete ho chuka hai to findById `null` dega aur `req.user = null`
  //    ho jaayega. Aage `authorization()` me `if (!req.user)` wala check hai,
  //    wo 401 de dega — isliye app crash nahi hogi.
  req.user = userData;

  // next() = "mera kaam ho gaya, agla middleware chalao"
  // ⚠️ Ye call karna MAT bhoolna, warna request hamesha ke liye atak jaayegi —
  //    na response aayega, na error. Client timeout hoga. Sabse gandi bug.
  next();
};

module.exports = authMiddleware;

// ============================================================================
// 💡 IMPROVEMENT IDEAS (abhi apply nahi kiye — logic waisa ka waisa rakha hai)
//
// 1. Response JSON me bhejo, plain text me nahi:
//        return res.status(401).json({ success: false, message: "..." });
//    Baaki poori API JSON deti hai, sirf ye 2 jagah text deti hai — frontend
//    ko `response.json()` pe parse error aayega.
//
// 2. `console.log("decoded", decoded)` production se hata do.
//
// 3. User null ho to yahin rok do (saaf message ke liye):
//        if (!userData) return next(apiError.unauthorized("User no longer exists"));
//
// 4. Banned user check:
//        if (!userData.isActive) return next(apiError.forbidden("Account deactivated"));
//    (Iske liye authModel me isActive field chahiye hogi.)
// ============================================================================
