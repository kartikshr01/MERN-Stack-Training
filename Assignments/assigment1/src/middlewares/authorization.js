// ============================================================================
// src/middlewares/authorization.js
//
// AUTHORIZATION = "tumhe permission hai?"   (AUTHENTICATION se alag cheez hai)
//

// ============================================================================

const apiError = require("../utils/apiError");

/**
 * authorize karne wala middleware.
 * Use: authorization("admin", "seller")
 *
 * (...roles) = REST PARAMETER. Jitne bhi arguments do, sab ek array me aa jaate hain.
 * authorization("admin", "seller")  ->  roles = ["admin", "seller"]
 */
const authorization = (...roles) => {
  return (req, res, next) => {
    // Safety: agar authMiddleware lagana bhool gaye to req.user hoga hi nahi.
    // Bina is check ke neeche `req.user.role` pe "Cannot read properties of
    // undefined" crash aata.
    if (!req.user) {
      return next(apiError.unauthorized("Please login first"));
    }

    if (!roles.includes(req.user.role)) {
      // ⚠️ 403 FORBIDDEN, 401 nahi!
      //    401 = "tum kaun ho? ID dikhao"        -> login karne se kaam ban jaayega
      //    403 = "ID sahi hai, par entry nahi"   -> login karne se KUCH NAHI hoga
      //    Pehle yahan 401 tha — frontend ko lagta ki token kharab hai aur
      //    wo user ko logout karke login page pe bhej deta. Galat behaviour.
      return next(
        apiError.forbidden(`Role '${req.user.role}' is not allowed to access this resource`)
      );
    }

    next();
  };
};

module.exports = authorization;

// ============================================================================

//
//    if (!roles.includes(req.user.role)) {
//        res.status(401).send({ message: "You are not authorized..." });   // ⬅ return NAHI tha
//    }
//    next();   // ⬅ ye FIR BHI chal jaata tha!
//
// Kya hota tha: unauthorized user ko response to chala jaata, PAR `next()`
// bhi chal jaata — matlab controller BHI chalta! Product create ho jaata!
// Aur phir controller `res.json()` karta to crash:
//     "Cannot set headers after they are sent to the client"
//
// Matlab: ek normal user bhi product delete kar sakta tha. 🔴
//
// SEEKH: middleware me response bhejne ke baad HAMESHA `return` karo.
//        `return res.status(...)` ya `return next(error)` — dono chalega.
// ============================================================================
