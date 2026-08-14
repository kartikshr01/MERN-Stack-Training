// ============================================================================
// src/service/authService.js
//
// AUTH ka SERVICE LAYER = dimaag 🧠
// Yahan register aur login ka ASLI kaam hota hai — DB check, password compare,
// token banana. Controller sirf isko bulata hai.
//
// Dhyaan do: is poori file me `req` ya `res` ek baar bhi nahi hai. Service ko
// HTTP ka pata hi nahi hona chahiye — wo sirf data leti hai aur data deti hai.
// ============================================================================

const AuthModel = require("../model/authModel");

// bcrypt = password hashing library
const bcrypt = require("bcrypt");

// refresh model import
const RefreshModel = require("../model/refreshTokenModel")

// jsonwebtoken = login ke baad token banane ke liye
const jwt = require("jsonwebtoken");

// .env file load karo (db_URL, secret_key isi me hain)
require("dotenv").config();

const accessKey = process.env.access_key;
const refreshKey = process.env.refresh_key;

// ============================================================================
// REGISTER
// ============================================================================
const registerService = async (data) => {
  // Destructuring — object me se sirf ye 4 keys nikaal lo
  const { name, email, password, role } = data;

  // ---------------------------------------------------------------------
  // Email pehle se registered to nahi?
  //
  // ⚠️ Ye check 100% pakka nahi hai — do requests bilkul ek saath aayein to
  //    dono ka findOne `null` dega aur dono create karne chalengi
  //    (RACE CONDITION). Asli safety authModel ke `email: { unique: true }`
  //    index se aati hai — wo error code 11000 deta hai jise errorHandler
  //    409 Conflict me badal deta hai.
  //    Matlab: ye check achhe MESSAGE ke liye hai, index SAFETY ke liye.
  // ---------------------------------------------------------------------
  const userExist = await AuthModel.findOne({ email });
  if (userExist) {
    // throw kiya, res.send nahi — service ko HTTP se matlab nahi.
    // Ye error controller ke catch me jaayega.
    throw new Error("user already exist");
  }

  const newUser = {
    name: name,
    email: email,
    // ⚠️ PLAIN password bhej rahe hain — ye galti NAHI hai!
    //    authModel ka `pre("save")` hook isko apne aap hash kar dega:
    //        this.password = await bcrypt.hash(this.password, 10);
    //    Isliye yahan bcrypt.hash likhne ki zaroorat nahi. Agar yahan bhi
    //    hash kar dete to password DOUBLE hash ho jaata aur login kabhi
    //    nahi chalta — ye ek bahut common bug hai.
    password: password,
    role: role,
  };

  // create() = new + save() ek saath. `save` hai isliye pre("save") hook chalega.
  await AuthModel.create(newUser);
};

// ============================================================================
// LOGIN
// ============================================================================
const loginService = async (data) => {
  // ⚠️ Ye debug log hai — secret key terminal me print ho rahi hai!
  //    Production me isko ZAROOR hatana. Logs kai jagah store hote hain.
  console.log(process.env.secret_key);

  const { email, password } = data;

  // User exist karta hai?
  const userExist = await AuthModel.findOne({ email });
  if (!userExist) {
    throw new Error("user not found");
  }

  // ---------------------------------------------------------------------
  // Password match karo
  //
  // bcrypt.compare(plainPassword, hashedPassword)
  //
  // Hash ek tarfa (ONE-WAY) hota hai — hash se wapas asli password nikaal
  // nahi sakte. To match kaise karte hain?
  // bcrypt user ka diya hua password USI SALT se dobara hash karta hai aur
  // dono hash compare karta hai. Salt hash ke andar hi store hota hai.
  //
  // 💡 Isiliye `password === userExist.password` KABHI kaam nahi karega —
  //    DB me hash pada hai, user plain bhej raha hai.
  // ---------------------------------------------------------------------
  const isMatch = await bcrypt.compare(password, userExist.password);
  if (!isMatch) {
    // ⚠️ Message dono case me alag hai ("user not found" vs "invalid credentials").
    //    Security ke hisaab se dono ka SAME message hona chahiye —
    //    "Invalid email or password". Warna attacker pata laga sakta hai ki
    //    kaunsa email registered hai (USER ENUMERATION attack).
    throw new Error("invalid credentials");
  }

  // ---------------------------------------------------------------------
  // Token banao
  //
  // jwt.sign(PAYLOAD, SECRET, OPTIONS)
  //
  //   PAYLOAD = { id: userExist._id }
  //     Ye data token ke andar chala jaata hai. Baad me authValidation.js me
  //     `decoded.id` isi se milta hai.
  //     ⚠️ Payload ENCRYPTED nahi hota — sirf base64 ENCODED hota hai.
  //        Koi bhi jwt.io pe daal ke padh sakta hai! Isliye payload me
  //        password ya koi secret KABHI mat daalna. Sirf id/role daalo.
  //
  //   SECRET = server ka secret. Isse SIGNATURE banta hai, jisse pata chalta
  //     hai ki token humne hi banaya tha. Koi payload badal de to signature
  //     match nahi karega aur jwt.verify() throw kar dega.
  //
  //   expiresIn: "1h" = 1 ghante baad token khud-b-khud invalid.
  //     Chota rakhna accha hai — token chori ho jaaye to kam nuksaan.
  // ---------------------------------------------------------------------
  // const token = jwt.sign({ id: userExist._id }, secretKey, { expiresIn: "1h" });

  //Access Token
  const accessToken = jwt.sign({
    id: userExist._id,
  }, accessKey, {
    expiresIn: "7d"
  })
  
  //Refresh Token
  const refreshToken = jwt.sign({
    id: userExist._id,
  }, refreshKey, {
    expiresIn: "7d"
  })

  await RefreshModel.create({
    refreshToken: refreshToken,
    userId: userExist._id,
    expiredAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  })

  // Token wapas controller ko — cookie SET karna controller ka kaam hai,
  // service ka nahi (kyunki cookie ek HTTP cheez hai).
  return {accessToken, refreshToken};
};

module.exports = { registerService, loginService };
