// ============================================================================
// src/controller/authController.js
//
// AUTH ka CONTROLLER LAYER = translator 🗣️
//
// Kaam bas 3: req se data nikalo -> service ko do -> response bhejo.
// Yahan koi DB query nahi, koi bcrypt nahi, koi jwt.sign nahi — wo sab
// service ka kaam hai.
// ============================================================================

const authService = require("../service/authService");

/**
 * @desc   Naya user register karo
 * @route  POST /auth/register
 */
const registerUser = async (req, res) => {
  try {
    // req.body me se sirf ye 4 fields uthai — baaki jo bhi aaya wo ignore.
    // ⚠️ `role` client se aa raha hai! Matlab koi bhi banda register karte
    //    waqt {"role": "admin"} bhej ke KHUD KO ADMIN bana sakta hai. 🔴
    //    Isko PRIVILEGE ESCALATION kehte hain. Register me role hamesha
    //    "user" hardcode karna chahiye; admin/seller alag flow se bane.
    const { name, email, password, role } = req.body;

    await authService.registerService({ name, email, password, role });

    // ⚠️ Yahan 201 CREATED hona chahiye (naya user bana hai), 200 nahi.
    //    res.send() default 200 bhejta hai.
    res.send("user created successfully");
  } catch (err) {
    // ⚠️ Har error pe 500 bhej rahe hain — chahe user ki galti ho ya server ki.
    //    "user already exist" actually 409 CONFLICT hai, 500 nahi.
    //    Product APIs me ye problem solve ho chuki hai (errorHandler se) —
    //    yahan bhi `next(err)` karke wahi errorHandler use kar sakte ho.
    res.status(500).send("internal server error");
    console.log(err);
  }
};

/**
 * @desc   Login karo, cookie me token set karo
 * @route  POST /auth/login
 */
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Service token banake wapas karti hai
    const token = await authService.loginService({ email, password });

    // -----------------------------------------------------------------
    // Cookie SET karna CONTROLLER ka kaam hai (service ka nahi) —
    // kyunki cookie ek HTTP cheez hai aur service ko HTTP ka pata nahi hota.
    //
    // httpOnly: true  -> JavaScript (document.cookie) ise padh NAHI sakta.
    //                    XSS attack me token chori nahi hoga. Isliye
    //                    localStorage se cookie behtar hai.
    //
    // 💡 Production me ye 2 aur options bhi lagti hain:
    //    secure: true    -> sirf HTTPS pe cookie jaayegi
    //    sameSite: "strict" -> CSRF attack se bachaav
    // -----------------------------------------------------------------
    res.cookie("tokens", {accessToken, refreshToken}, { httpOnly: true });

    // ⚠️ Sirf message bhej rahe hain. Frontend ko usually user ka
    //    name/role bhi chahiye hota hai UI dikhane ke liye.
    res.send("login successful");
  } catch (err) {
    // ⚠️ "user not found" aur "invalid credentials" dono 401 hone chahiye, 500 nahi.
    res.status(500).send("internal server error");
    console.log(err);
  }
};

/**
 * @desc   Logout — cookie hata do
 * @route  POST /auth/logout
 */
const logoutUser = (req, res) => {
  try {
    // clearCookie me WAHI options dene padte hain jo set karte waqt diye the,
    // warna browser cookie ko match nahi kar paata aur wo delete hi nahi hoti.
    // Isliye yahan bhi { httpOnly: true } hai.
    res.clearCookie("token", { httpOnly: true });
    res.send("logout successfully");

    // 💡 Ek important baat class me batane layak:
    //    JWT STATELESS hota hai — server uski koi list nahi rakhta.
    //    Cookie hatane se token "mar" nahi jaata; agar kisi ne wo token
    //    pehle copy kar liya ho to wo expiry (1h) tak chalta rahega.
    //    Isliye expiry chhoti rakhte hain, aur asli logout chahiye ho to
    //    Redis me "blacklist" rakhni padti hai.
  } catch (err) {
    console.log(err);
  }
};

module.exports = { registerUser, loginUser, logoutUser };
