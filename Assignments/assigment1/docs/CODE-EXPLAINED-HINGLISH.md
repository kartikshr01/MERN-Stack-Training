# 📖 Code Explained — Line by Line (Hinglish)

Ye document **aapke apne code** ko line-by-line samjhata hai — har file kya karti hai,
har line kyun likhi hai, aur ek request ka poora safar kaisa hota hai.

> ⚠️ Poora explanation **aapke asli Product schema** ke 5 fields pe based hai:
> `name`, `SKU`, `price`, `description`, `category` — koi naya field add nahi kiya gaya.

---

## 📑 Index

1. [Restaurant Analogy](#1-restaurant-analogy--pehle-ye-samjho)
2. [Aapka Product Schema](#2-aapka-product-schema--yahi-5-fields-hain)
3. [File-by-File — kaunsi file kya karti hai](#3-file-by-file--kaunsi-file-kya-karti-hai)
4. [Ek Request ka Poora Safar](#4-ek-request-ka-poora-safar-step-by-step)
5. [`server.js`](#5-serverjs)
6. [`utils/` — teen chhote tools](#6-utils--teen-chhote-tools)
7. [`validationSchema/productValidationSchema.js`](#7-validationschemaproductvalidationschemajs)
8. [`middlewares/`](#8-middlewares)
9. [`service/productService.js`](#9-serviceproductservicejs)
10. [`controller/productController.js`](#10-controllerproductcontrollerjs)
11. [`routes/product.route.js`](#11-routesproductroutejs)
12. [Har API ka Alag Flow](#12-har-api-ka-alag-flow)
13. [2 Bugs jo aapke code me the](#13-2-bugs-jo-aapke-code-me-the-)
14. [Top 12 Galtiyan](#14-top-12-galtiyan)

---

## 1. Restaurant Analogy — pehle ye samjho

Backend ko ek **restaurant** samjho:

| Restaurant | Code | Kaam |
|---|---|---|
| 🚪 **Bouncer** (ID check) | `authMiddleware` | "Tum kaun ho?" — token check |
| 🎫 **VIP list** | `authorization("admin")` | "Tumhe andar aane ki permission hai?" |
| 📋 **Menu check** | `validationMiddleware` (Joi) | "Ye dish menu me hai hi nahi bhai" |
| 🧑‍💼 **Waiter** | `productController` | Order leta hai, kitchen ko deta hai, khana laata hai |
| 👨‍🍳 **Chef** | `productService` | **Asli kaam** — khana banata hai |
| 📜 **Recipe** | `productModel` | Kya-kya ingredient, kitna |
| 🏪 **Godown** | MongoDB | Saara saamaan yahan |
| 🚦 **Reception** | `product.route.js` | Kaunsa order kahan jaayega |
| 🏥 **First-aid room** | `errorHandler` | Kuch bhi galat ho to sab yahan |

**Sabse important baat:**
> Waiter khana nahi banata. Chef table pe serve nahi karta.
> **Har banda apna kaam karta hai.** Yahi MVC + Service pattern hai.

Pehle aapke code me waiter hi khana bana raha tha (`getAllProducts` ka poora DB code
route file me pada tha) — isliye:
- Wahi logic dobara chahiye to copy-paste karna padta
- Test karna mushkil (poora Express chalana padta)
- Route file lambi hoti chali jaati

---

## 2. Aapka Product Schema — yahi 5 fields hain

```js
// src/model/productModel.js  (ISME KUCH NAHI BADLA)
const productSchema = new mongoose.Schema({
  name:        { type: String, minLength: 2, maxLength: 64, required: true, trim: true },
  SKU:         { type: String, unique: true, required: true, trim: true },
  price:       { type: Number, min: 0, required: true },
  description: { type: String, maxLength: 264, trim: true },
  category:    { type: String, enum: ["Electronics","Clothing","Books","Home","Sports"],
                 required: true, trim: true, minLength: 2, maxLength: 64 }
});
```

### Har option ka matlab

| Option | Matlab |
|---|---|
| `type: String` | Data type |
| `required: true` | Bina iske document save hi nahi hoga |
| `trim: true` | `"  Laptop  "` → `"Laptop"` (aage-peeche ki space hat gayi) |
| `minLength: 2` | Kam se kam 2 character |
| `maxLength: 64` | Zyada se zyada 64 character |
| `unique: true` | DB level pe duplicate nahi banega — **aur ye ek INDEX bhi banata hai** |
| `min: 0` | Number ki minimum value (price negative nahi ho sakti) |
| `enum: [...]` | Sirf ye 5 values allowed |

### 3 baatein jo is schema se nikalti hain (aur code ko affect karti hain)

**1. `unique: true` sirf validation nahi, ek INDEX hai**
Isliye SKU se search karna **fast** hai. Aur duplicate aane pe MongoDB error
code `11000` deta hai — humara `errorHandler` usko **409 Conflict** me badal deta hai.

**2. `timestamps: true` nahi hai** → `createdAt` / `updatedAt` fields **hain hi nahi**
Matlab `sort({ createdAt: -1 })` kaam nahi karega.
**Jugaad:** MongoDB ke `_id` (ObjectId) ke andar hi creation ka timestamp chhupa hota hai!
Isliye humne default sort `{ _id: -1 }` rakha = "naya product pehle". 👌

**3. `category` me `required: true` aur `trim: true` DO BAAR likhe hue hain**
Code chalega (galti nahi hai, sirf repeat hai) — par saaf-safai ke liye hata sakte ho.

---

## 3. File-by-File — kaunsi file kya karti hai

| File | Ek line me kaam | Kitni baar chalti hai |
|---|---|---|
| `server.js` | Middlewares + routes + error handler lagao, DB connect, listen | **1 baar** (app start pe) |
| `src/config/db.js` | MongoDB se connection | **1 baar** |
| `src/routes/product.route.js` | URL → middleware chain | **Har request** pe match |
| `src/middlewares/authValidation.js` | Cookie se token → `req.user` | Har protected request |
| `src/middlewares/authorization.js` | Role check | Har protected request |
| `src/middlewares/validationMiddleware.js` | Joi se body/query/params check | Har validated request |
| `src/controller/productController.js` | `req` se data, service call, response | Har request |
| `src/service/productService.js` | **Business logic + DB query** | Har request |
| `src/model/productModel.js` | Schema (1 baar) + validation (har save) | Mixed |
| `src/middlewares/errorHandler.js` | Error → JSON | **Sirf error aane pe** |
| `src/utils/*` | Reusable helpers | Jahan import kiya |

---

## 4. Ek Request ka Poora Safar (step by step)

Maan lo client ne bheja:

```http
POST /products/createProduct
Cookie: token=eyJhbGci...
Content-Type: application/json

{ "name": "Laptop", "SKU": "LP-001", "price": 55000, "category": "Electronics" }
```

```
STEP 1 → server.js: cookieParser()
         Cookie string parse hui. Ab `req.cookies.token` exist karta hai.
         ⚠️ Iske bina req.cookies UNDEFINED hota hai.

STEP 2 → server.js: express.json()
         Raw bytes → JavaScript object. Ab `req.body` exist karta hai.
         ⚠️ Iske bina req.body UNDEFINED hota hai.

STEP 3 → server.js: app.use("/products", productRouter)
         URL "/products" se shuru hota hai. Match!
         Bacha hua URL: "/createProduct"

STEP 4 → product.route.js: productRouter.post("/createProduct", ...)
         Method POST + path match. Chain shuru:

STEP 5 → authMiddleware
         req.cookies.token nikala → jwt.verify() → DB se user laaya
         → req.user set kiya → next()
         ❌ Token nahi mila to: 401, safar yahin khatam

STEP 6 → authorization("admin", "seller")
         req.user.role = "seller" → allowed list me hai → next()
         ❌ role "user" hota to: 403 Forbidden

STEP 7 → validationMiddleware(createProductSchema)
         Joi ne body check ki:
           name "Laptop"        ✅ (2-64 chars)
           SKU "LP-001"         ✅
           price 55000          ✅ (>= 0)
           category "Electronics" ✅ (enum me hai)
           description missing  ✅ (required nahi hai)
         Extra field aaya hota to CHUP-CHAAP hata deta (stripUnknown)
         req.body ab SAAF hai → next()
         ❌ Fail hota to: 400 + field-wise errors array

STEP 8 → productController.createProduct
         req.body uthaya → productService.createProduct(req.body) call kiya

STEP 9 → productService.createProduct
         findOne({ SKU }) → duplicate check
         Mila hota to: throw apiError.conflict() → 409
         Nahi mila → ProductModel.create(data)

STEP 10 → Mongoose schema validation
          name length 2-64? ✅  price >= 0? ✅  category enum me? ✅
          → MongoDB me INSERT

STEP 11 → MongoDB ne document return kiya → service ne return kiya

STEP 12 → controller: res.status(201).json({ success, message, data })

STEP 13 → CLIENT ko 201 Created mil gaya ✅
```

### Aur agar STEP 9 me error aaya?

```
service ne throw kiya  (throw apiError.conflict(...))
   ↓
Express 5 ne apne aap pakad liya   ⭐ (Express 4 me ye khud nahi hota tha)
   ↓
saare normal middleware SKIP ho gaye
   ↓
errorHandler → res.status(409).json({ success: false, message: "..." })
   ↓
CLIENT
```

> 💡 **Yaad rakho:**
> `next()` = "agla middleware chalao"
> `next(err)` = "sab skip karo, seedha error handler pe jao"
> `throw` (async function me, Express 5) = same as `next(err)`

---

## 5. `server.js`

### Middleware ka ORDER = sab kuch

```js
app.use(cookieParser());     // 1. cookie parse
app.use(express.json());     // 2. body parse
app.use("/auth", authRouter);        // 3. routes
app.use("/products", productRouter);
app.use("/address", addressRouter);
app.use(notFound);           // 4. 404 handler
app.use(errorHandler);       // 5. error handler — SABSE LAST
```

**Order galat kiya to kya hoga:**

| Galti | Result |
|---|---|
| `express.json()` routes ke BAAD | `req.body` hamesha `undefined` |
| `cookieParser()` routes ke BAAD | `req.cookies` hamesha `undefined` → har request 401 |
| `errorHandler` routes se PEHLE | Error handler **kabhi chalega hi nahi** |
| `notFound` routes se PEHLE | Har request 404 dega 😅 |

### DB pehle, listen baad me

```js
connectDB()
  .then(() => { app.listen(3000, ...); })
  .catch((err) => { console.log("database connection error", err); });
```

Ulta kiya to server chalu ho jaayega aur pehli request DB error degi — user ko
"500" milega jabki asli problem startup ki thi.

---

## 6. `utils/` — teen chhote tools

### `httpStatus.js`

```js
OK: 200, CREATED: 201, BAD_REQUEST: 400, UNAUTHORIZED: 401,
FORBIDDEN: 403, NOT_FOUND: 404, CONFLICT: 409, INTERNAL_SERVER_ERROR: 500
```

`res.status(404)` me 404 ek **number** hai — padhne me kuch pata nahi chalta.
`res.status(httpStatus.NOT_FOUND)` **English** hai — code khud bolta hai.

**Bonus:** 404 ki jagah galti se 400 likh doge to koi nahi rokega.
`NOT_FOUD` galat spelling likhoge to `undefined` aayega aur turant pakda jaayega.

### `apiError.js`

Yahan koi `class` nahi hai — bas **simple functions**. Error banao, usme apni
properties chipka do, wapas kar do. Itna hi.

```js
const createError = (statusCode, message, errors = []) => {
  const error = new Error(message);

  error.statusCode = statusCode;
  error.errors = errors;
  error.isOperational = true;

  return error;
};
```

**`new Error(message)` kyun, plain object `{}` kyun nahi?**
Error ke saath **stack trace** apne aap milta hai — matlab galti **kis file ki kis line**
pe hui, wo pata chal jaata hai. Plain object throw karoge to ye information bilkul
nahi milegi aur debugging narak ban jaayegi.

**`error.statusCode = statusCode` — ye kaise chal gaya?**
JavaScript me kisi bhi object pe **kabhi bhi nayi property** laga sakte ho.
Error bhi ek object hi hai. Isliye class banane ki koi zaroorat hi nahi padi —
existing Error object me statusCode chipka diya, kaam ho gaya.

**Toh `statusCode` chahiye hi kyun tha?**
Normal `new Error("not found")` me sirf `message` hota hai. `errorHandler` ko kaise
pata chalega ki **404** bhejna hai ya **500**? Isliye ye extra property zaroori hai.

```js
const notFound = (resource = "Resource") => createError(404, `${resource} not found`);
const conflict = (message = "Already exists") => createError(409, message);
```

Ye **shortcuts** hain — har jagah `createError(404, "Product not found")` likhna boring hai.
`= "Resource"` ek **default parameter** hai: kuch na bhejo to `"Resource"` le lega.

**Use karne ka tarika — `new` nahi lagana:**
```js
const apiError = require("../utils/apiError");

throw apiError.notFound("Product");                        // 404
throw apiError.conflict("SKU already exists");             // 409
throw apiError.createError(404, "Route not found: /xyz");  // custom message
```

> 💡 **Class ki zaroorat kab padti hai?** Jab ek hi cheez ke **bahut saare objects**
> banane ho jinme apna-apna data + apne methods ho (jaise Mongoose ka Model).
> Error banane jaisa chhota kaam ek function se ho jaata hai — class me lapetne se
> code bada hota hai, samajhne me aasaan nahi.

### `helpers.js` → `escapeRegex` ⭐ (search ki sabse important line)

```js
const escapeRegex = (string = "") =>
  String(string).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
```

Tod ke samjho:
- `[.*+?^${}()|[\]\\]` — ye saare **regex ke special characters** hain
- `g` flag — saare occurrences badlo, sirf pehla nahi
- `$&` — jo match hua **wahi** wapas rakho
- `"\\$&"` — uske **aage ek backslash** laga do (escape kar do)

**Example:** `"c++"` → `"c\+\+"` (ab `+` ka special meaning khatam, plain text ban gaya)

**2 problems solve karta hai:**

1. **Galat result** — user `"c++"` search kare, bina escape ke regex me `+` ka matlab
   hai "ek ya zyada" → query hi galat ban jaati.

2. **ReDoS attack** ⚠️ — user `?q=(a+)+$` bhej de to regex engine **exponential time**
   lene lagta hai. Node **single-threaded** hai — matlab **ek hi request poore server ko
   FREEZE** kar degi. Baaki saare users ka server hang. Ye asli DoS bug hai jisse
   companies ka production down ho chuka hai.

### `helpers.js` → `buildSort`

```js
const buildSort = (sortBy, allowedFields = []) => {
  const defaultSort = { _id: -1 };
  if (!sortBy) return defaultSort;
  ...
  if (cleanField && allowedFields.includes(cleanField)) {
    sort[cleanField] = order === "desc" ? -1 : 1;
  }
```

`"price:asc"` → `{ price: 1 }`
`"category:asc,price:desc"` → `{ category: 1, price: -1 }`

**`allowedFields` whitelist kyun?** User koi bhi random field bhej ke DB pe bhaari
unindexed sort nahi karwa sake.

**Default `{ _id: -1 }` kyun?** Aapke schema me `timestamps` nahi hai, isliye
`createdAt` field hai hi nahi. Par ObjectId ke andar creation timestamp chhupa hota
hai — to `_id: -1` = "naya product pehle". 👌

> 🔴 **Aapke purane code me sort galat tha:**
> ```js
> const { sort = "ASC" } = req.query;
> ... .sort(sort)
> ```
> `.sort("ASC")` ka matlab Mongoose ke liye hai: *"`ASC` naam ki field se sort karo"* —
> aisi koi field hai hi nahi, isliye kuch hota hi nahi tha. Chup-chaap fail.

---

## 7. `validationSchema/productValidationSchema.js`

### Joi kyun jab Mongoose validation already hai?

| | Joi | Mongoose |
|---|---|---|
| Kab chalta hai | DB call se **pehle** | DB write ke waqt |
| Kya validate karta hai | body + **query** + **params** | sirf document |
| Extra fields | **strip kar deta hai** ⭐ | ignore |
| Error format | field-wise, saaf | raw |
| Speed | Fast (DB call bachi) | DB tak jaana pada |

**Dono chahiye:** Joi = gate ka guard, Mongoose = ghar ka lock.

### Line-by-line

```js
const CATEGORIES = ["Electronics", "Clothing", "Books", "Home", "Sports"];
```
Ye **hubahu aapke model ke enum se** copy kiya hai. Ek jagah likh ke reuse (DRY) —
kal enum badla to sirf yahan badalna padega.

```js
const objectId = joi.string().pattern(/^[0-9a-fA-F]{24}$/)
```
MongoDB ObjectId hamesha **24 character ka hexadecimal** string hota hai.
Ye check yahan karne se galat ID pe DB call **jaayegi hi nahi**.

```js
limit: joi.number().integer().min(1).max(100).default(10),
```
**`max(100)` is file ki sabse important line hai.**
Bina iske user `?limit=99999999` bhej ke poora DB ek request me kheech lega →
memory bhar jaayegi → **server crash**. Ye asli DoS vector hai.

> 🔴 Aapke purane `getAllProducts` me `limit` pe koi check nahi tha.

```js
maxPrice: joi.number().min(0).greater(joi.ref("minPrice"))
```
`joi.ref("minPrice")` = *"usi object ki dusri field ko dekho"*.
Matlab `maxPrice` hamesha `minPrice` se bada hona chahiye — **cross-field validation**.

```js
category: joi.string().trim().valid(...CATEGORIES).required()
```
`...CATEGORIES` = **spread operator**. Array ko alag-alag arguments me tod deta hai:
`valid("Electronics", "Clothing", "Books", "Home", "Sports")`

> 🔴 Purane schema me sirf `joi.string().max(64).required()` tha — koi bhi category
> chal jaati aur error **Mongoose** se aata (raw, ganda message). Ab Joi hi saaf
> message ke saath rok deta hai.

```js
.min(1).messages({ "object.min": "At least one field is required to update" })
```
`.min(1)` **object pe** = "kam se kam 1 key honi chahiye".
Iske bina user `PATCH {}` bhejta rahega aur hum bekaar DB write karte rahenge.

### 🔴 3 mismatch jo purane Joi schema me the

| Field | Purana Joi | Aapka Model | Ab |
|---|---|---|---|
| `price` | `min(1)` | `min: 0` | `min(0)` ✅ |
| `description` | `max(256)` | `maxLength: 264` | `max(264)` ✅ |
| `category` | koi bhi string | `enum: [5 values]` | `valid(...CATEGORIES)` ✅ |

**Mismatch se kya hota tha:** 260 character wali description Joi se **nikal jaati**,
phir Mongoose pe ja ke fail hoti → user ko raw Mongoose error milta.
Do jagah rules alag ho to hamesha aisa hi confusion hota hai.

---

## 8. `middlewares/`

### `validationMiddleware.js` — ab teeno cheezein validate karta hai

```js
const validationMiddleware = (schema, property = "body") => {
  return (req, res, next) => { ... };
};
```
**Do arrow — ye "currying" hai.** `validationMiddleware(schema)` call karne pe ek
middleware function **return** hota hai. Isi wajah se route me `validationMiddleware(x)`
likh paate hain.

`property = "body"` **default value** hai — isliye aapka purana code
`validationMiddleware(registrationSchema)` bina badle chalta rahega. ✅

```js
const { value, error } = schema.validate(req[property], {
  abortEarly: false,
  stripUnknown: true,
  convert: true,
});
```

| Option | Kya karta hai | Kyun |
|---|---|---|
| `abortEarly: false` | **Saari** galtiyan ek saath | User ko baar-baar fix na karna pade |
| `stripUnknown: true` | Extra fields hata do | **Mass assignment se bachaav** ⭐ |
| `convert: true` | `"10"` → `10` | Query params **hamesha string** hote hain |

> 🔴 Purana code: `const { error } = schema.validate(req.body);`
> Sirf `error` liya, **`value` nahi**. Matlab converted/cleaned data use hi nahi hota tha —
> `req.body` waisa ka waisa raw rehta tha.

```js
const errors = error.details.map((detail) => ({
  field: detail.path.join("."),
  message: detail.message.replace(/"/g, ""),
}));
```
`error.details` ek **array** hai — har fail hui field ka apna object.

> 🔴 Purana code: `res.status(400).send(error.details[0].message)`
> Sirf **pehli** galti bhejta tha, aur plain string bhejta tha (JSON nahi).
> User 5 fields galat bhare to 5 baar request bhejni padti.

```js
if (property === "query") {
  Object.defineProperty(req, "query", { value, writable: true, configurable: true });
}
```
**⚠️ EXPRESS 5 GOTCHA — ye sabse naya wala trap hai.**
Aap Express `^5.2.1` use kar rahe ho. Express 5 me `req.query` sirf **GETTER** hai.
`req.query = value` likhoge to app crash hogi:
```
TypeError: Cannot set property query of #<IncomingMessage> which has only a getter
```
`Object.defineProperty` Express 4 **aur** 5 dono me chalta hai — isliye safe tarika hai.

### `authValidation.js` — AUTHENTICATION ("tum kaun ho?")

> Logic bilkul waisa hi hai jaisa aapne likha tha — sirf comments add kiye hain.

Poora middleware **3 steps** ka hai:

```
STEP 1: cookie se token nikalo      -> nahi mila to 401
STEP 2: token verify karo           -> galat/expired to 401
STEP 3: DB se FRESH user laao       -> req.user me rakh do -> next()
```

#### STEP 1 — token nikalna

```js
const token = req.cookies.token;
if (!token) {
  return res.status(401).send("Access denied. No token provided.");
}
```

Aap token **cookie** me bhejte ho (header me nahi). Login ke waqt authController me
`res.cookie("token", token, { httpOnly: true })` kiya tha — browser wo cookie **har
request ke saath apne aap** bhej deta hai.

- ⚠️ `req.cookies` tabhi exist karta hai jab `server.js` me **`cookieParser()`** laga ho.
  Wo nahi lagaya to yahan `Cannot read properties of undefined` crash aayega.
- ⚠️ `return` lagana **zaroori** hai — warna neeche ka code bhi chal jaayega.
  *(Yahi galti `authorization.js` me thi, jahan `return` missing tha.)*

> 💡 **`httpOnly: true` ka matlab** — JavaScript (`document.cookie`) is cookie ko
> **padh hi nahi sakta**. Isse XSS attack me token chori nahi ho sakta.
> Isiliye token `localStorage` me rakhne se **cookie behtar** hai. Ye interview
> question bhi hai: *"JWT localStorage me rakhein ya cookie me?"*

#### STEP 2 — token verify karna

```js
const decoded = jwt.verify(token, secretKey);
```

`jwt.verify()` **2 kaam** karta hai:
1. **Signature check** — token se chhed-chhaad to nahi hui? Koi apna banaya hua
   nakli token to nahi bhej raha?
2. **Expiry check** — login me `expiresIn: "1h"` diya tha, wo nikal to nahi gaya?

Safal hone pe wo **payload** wapas karta hai — wahi jo sign karte waqt daala tha:
```js
jwt.sign({ id: userExist._id }, secretKey, { expiresIn: "1h" })
// decoded = { id: "68a1...", iat: 1699999999, exp: 1700003599 }
//            iat = issued at (kab bana)    exp = expiry (kab marega)
```

> ⚠️ **BADI BAAT:** `jwt.verify` fail hone pe `null` **return nahi karta — wo THROW karta hai.**
> Isliye neeche wala `if (!decoded)` check **kabhi chalta hi nahi**:
> ```js
> if (!decoded) {
>   return res.status(400).send("please login again.");   // ye line kabhi nahi chalti
> }
> ```
> Ab wo throw seedha `errorHandler` tak jaata hai (Express 5 async errors khud
> forward karta hai), jahan:
> `JsonWebTokenError` → **401 "Invalid token"**
> `TokenExpiredError` → **401 "Token expired, please login again"**
> Isliye ye file badalni **nahi padi** — errorHandler ne sambhal liya. 👍

#### STEP 3 — DB se fresh user laana

```js
const userData = await AuthModel.findById(decoded.id);
req.user = userData;
next();
```

**Sawaal:** token me `id` to hai hi — phir DB call kyun? Ek extra query kyun?

**Jawaab:** token **valid** hone ka matlab ye **nahi** ki user abhi bhi exist karta hai.
- User ka account **delete** ho gaya ho sakta hai
- Admin ne use **ban** kar diya ho sakta hai
- Uska **role** `"user"` se `"seller"` (ya ulta) badla ho sakta hai

...aur uska 1 ghante wala token abhi bhi valid hai!

> 🎯 **Ek line me:** token ek **"purana photo"** hai, DB **"aaj ki asliyat"**.
> Isliye har request pe fresh user uthate hain.

**`decoded.id` hi kyun?** Kyunki login me `jwt.sign({ id: userExist._id }, ...)` likha tha.
Agar wahan `{ userId: ... }` likha hota to yahan `decoded.userId` likhna padta.
**Dono jagah naam match karna zaroori hai.**

**`req.user` set karne ke baad** aage ka har middleware/controller isko use kar sakta hai:
- `authorization.js` → `req.user.role` check karta hai
- controller → `req.user._id` se pata chalta hai kisne request bheji

> ⚠️ Agar user delete ho chuka hai to `findById` **`null`** dega aur `req.user = null`
> ho jaayega. Aage `authorization()` me `if (!req.user)` wala check hai — wo **401**
> de dega, isliye app crash nahi hogi.

#### `next()` — sabse zaroori line

```js
next();
```
"Mera kaam ho gaya, agla middleware chalao."
**Ye call karna MAT bhoolna** — warna request **hamesha ke liye atak jaayegi**.
Na response aayega, na error. Client timeout hoga. Sabse gandi bug, kyunki dikhti bhi nahi.

#### 💡 Is file me 3 improvements possible hain

| # | Abhi kya hai | Behtar kya hoga | Kyun |
|---|---|---|---|
| 1 | `res.status(401).send("Access denied...")` | `.json({ success: false, message })` | Baaki poori API JSON deti hai, sirf ye text — frontend ka `.json()` parse fail hoga |
| 2 | `console.log("decoded", decoded)` | hata do | Har request pe user id logs me print ho rahi hai |
| 3 | `req.user = userData` (null ho sakta hai) | `if (!userData) return next(apiError.unauthorized(...))` | Saaf message mile |

*(Ye apply nahi kiye — logic waisa ka waisa rakha hai. Aap decide karo.)*

---

### `authService.js` — auth ka dimaag 🧠

#### Register — password hash kahan hota hai?

```js
const newUser = {
  name, email,
  password: password,   // ⬅ PLAIN password bhej rahe hain!
  role: role,
};
await AuthModel.create(newUser);
```

**Ye galti nahi hai!** `authModel.js` ka `pre("save")` hook isko apne aap hash kar deta hai:
```js
authSchema.pre("save", async function () {
  if (!this.isModified("password")) return this.password;
  this.password = await bcrypt.hash(this.password, 10);
});
```

> ⚠️ Agar service me **bhi** `bcrypt.hash()` kar dete, to password **DOUBLE hash**
> ho jaata aur login **kabhi** nahi chalta. Ye bahut common bug hai —
> "register to ho gaya par login nahi ho raha" wali problem.

**`isModified("password")` kyun?** Taaki jab user apna sirf naam update kare, to
already-hashed password **dobara hash na ho jaaye**.

#### Login — password compare

```js
const isMatch = await bcrypt.compare(password, userExist.password);
```

Hash **ONE-WAY** hota hai — hash se wapas asli password nikaal nahi sakte.
**To match kaise hota hai?** bcrypt user ka diya password **usi salt** se dobara
hash karta hai aur dono hash compare karta hai. Salt hash ke andar hi store hota hai.

> 💡 Isiliye `password === userExist.password` **kabhi** kaam nahi karega —
> DB me hash pada hai, user plain bhej raha hai.

#### Token banana

```js
const token = jwt.sign({ id: userExist._id }, secretKey, { expiresIn: "1h" });
return token;
```

| Hissa | Matlab |
|---|---|
| `{ id: userExist._id }` | **Payload** — ye data token ke andar jaata hai |
| `secretKey` | Isse **signature** banta hai — proof ki token humne banaya |
| `expiresIn: "1h"` | 1 ghante baad token khud-b-khud invalid |

> 🔴 **BAHUT IMPORTANT:** JWT ka payload **ENCRYPTED nahi hota** — sirf **base64
> encoded** hota hai. Koi bhi jwt.io pe daal ke padh sakta hai!
> **Payload me password ya koi secret KABHI mat daalna.** Sirf `id` / `role` daalo.

**Service token `return` karti hai, cookie set nahi karti** — kyunki cookie ek **HTTP
cheez** hai. Service ko HTTP ka pata nahi hona chahiye. Cookie set karna **controller**
ka kaam hai.

> ⚠️ **Security note:** `"user not found"` aur `"invalid credentials"` — dono message
> **alag** hain. Isse attacker pata laga sakta hai ki **kaunsa email registered hai**
> (ise **USER ENUMERATION** kehte hain). Dono ka same message hona chahiye:
> *"Invalid email or password"*.

---

### `authController.js` — cookie yahan set hoti hai

```js
res.cookie("token", token, { httpOnly: true });
```

Production me 2 aur options lagti hain:
```js
res.cookie("token", token, {
  httpOnly: true,
  secure: true,        // sirf HTTPS pe cookie jaayegi
  sameSite: "strict",  // CSRF attack se bachaav
});
```

#### Logout ka sach 🤔

```js
res.clearCookie("token", { httpOnly: true });
```

`clearCookie` me **wahi options** dene padte hain jo set karte waqt diye the —
warna browser cookie match nahi kar paata aur wo **delete hi nahi hoti**.

> 🎯 **Class me poochhne layak sawaal:** *"Logout ke baad kya token mar jaata hai?"*
> **Nahi.** JWT **stateless** hota hai — server uski koi list nahi rakhta.
> Cookie hatane se sirf **browser** se token gaya. Agar kisi ne wo token pehle
> **copy** kar liya ho to wo **expiry (1h) tak chalta rahega**.
> Isliye expiry chhoti rakhte hain. Asli instant logout chahiye ho to Redis me
> **blacklist** rakhni padti hai.

#### 🔴 Register me ek bada bug

```js
const { name, email, password, role } = req.body;
await authService.registerService({ name, email, password, role });
```

**`role` client se aa raha hai!** Matlab koi bhi banda register karte waqt
`{"role": "admin"}` bhej ke **khud ko admin bana sakta hai** — aur phir products
delete kar sakta hai.

Isko **PRIVILEGE ESCALATION** kehte hain.

**Fix:** register me role hamesha hardcode karo:
```js
await authService.registerService({ name, email, password, role: "user" });
```
Admin/seller alag flow se banein (existing admin banaye, ya seed script se).

*(Apply nahi kiya — aapka logic waisa ka waisa rakha hai.)*

### `errorHandler.js` (naya)

```js
const errorHandler = (err, req, res, next) => { ... }
```
**⚠️ 4 PARAMETERS ZAROORI HAIN.** Express `function.length` dekh ke decide karta hai
ki ye error middleware hai ya normal. 3 likhoge to Express isko **normal middleware**
samjhega aur ye **kabhi chalega hi nahi**. `next` use na ho tab bhi likhna padega.

```js
else if (err.code === 11000) {
  statusCode = httpStatus.CONFLICT;   // 409
  const field = Object.keys(err.keyValue || {})[0] || "field";
  message = `This ${field} already exists`;
}
```
`11000` = MongoDB ka **duplicate key** error code.
Aapke case me ye **SKU** pe lagega (`unique: true`).
Ye **400 nahi, 409 Conflict** hai — request bilkul sahi thi, bas cheez pehle se hai.

```js
...(process.env.NODE_ENV === "production" ? {} : { stack: err.stack })
```
Spread ke saath conditional. Production me `{}` spread hoga (kuch add nahi),
development me `stack` add ho jaayega.

**Production me stack kabhi mat bhejna** — usme file paths, package versions,
kabhi DB structure tak leak hota hai. Attacker ke liye ye **free information** hai.

---

## 9. `service/productService.js`

> Ye file pehle **bilkul khaali** thi (0 bytes). Saara logic route file me pada tha.

### Service ka golden rule

```
✅ Service me: DB query, business logic, duplicate check, calculation
❌ Service me: req, res, next, res.status()  — HTTP ka naam bhi nahi
```

**Test:** agar service function `req` maangta hai → design galat hai.
Jo chahiye wo **parameter** me lo.

**Fayda:** kal ko yahi logic CRON job se, CLI script se, ya admin panel se call
karna pade → service **jaisi ki waisi** chalegi.

### `_buildFilter` — query params se MongoDB filter

```js
const _buildFilter = ({ category, minPrice, maxPrice }) => {
```
`_` prefix = *"ye function sirf isi file ke andar use hota hai"*.
JavaScript force nahi karta, par ye ek **strong convention** hai.

```js
if (minPrice !== undefined || maxPrice !== undefined) {
  filter.price = {};
  if (minPrice !== undefined) filter.price.$gte = minPrice;
  if (maxPrice !== undefined) filter.price.$lte = maxPrice;
}
```
`$gte` = greater than or equal, `$lte` = less than or equal.

**⚠️ `!== undefined` likha, sirf `if (minPrice)` nahi — KYUN?**
Kyunki **`0` bhi falsy hai!** `minPrice=0` ek valid filter hai par `if (0)` false dega
aur filter lagega hi nahi. **Ye bug bahut common hai** — interview me bhi puchte hain.

### `createProduct` — race condition wali baat ⭐

```js
const productExist = await ProductModel.findOne({ SKU: data.SKU });
if (productExist) throw apiError.conflict(`Product with SKU '${data.SKU}' already exists`);
const newProduct = await ProductModel.create(data);
```

**Ye check 100% pakka NAHI hai.** Do requests bilkul ek saath aa jaayein to dono ka
`findOne` `null` dega aur dono `create` karne chalengi. Isko **RACE CONDITION** kehte hain.

**To bachaata kaun hai?** Model ka `SKU: { unique: true }` **index**.
Wo error code `11000` dega, jise `errorHandler` **409** me badal deta hai.

**Matlab:**
- `findOne` check = achhe **MESSAGE** ke liye
- `unique` index = asli **SAFETY** ke liye

Ye ek badhiya class discussion topic hai. 👍

### `getAllProducts` — `Promise.all` ka fayda

```js
const [products, totalResults] = await Promise.all([
  ProductModel.find(filter).select(LIST_FIELDS).sort(sort).skip(skip).limit(limit).lean(),
  ProductModel.countDocuments(filter),
]);
```

**`Promise.all` = dono queries EK SAATH (parallel).**
- Sequential: 40ms + 30ms = **70ms**
- Parallel: max(40, 30) = **40ms** ← muft ki speed

Array destructuring `[a, b]` se dono results alag-alag mil jaate hain.

```js
const skip = (page - 1) * limit;
```
page 1 → skip 0 (pehle 10) · page 2 → skip 10 (agle 10) · page 3 → skip 20

```js
.lean()
```
Mongoose document ki jagah **plain JavaScript object** deta hai — **2-3x fast + kam memory**,
kyunki Mongoose change-tracking wrapper nahi banata.

**Trade-off:** `.lean()` ke baad `.save()` aur document methods nahi milte.
> **Rule:** sirf **padhna** hai → `.lean()` lagao. **Modify** karke save karna hai → mat lagao.

```js
const LIST_FIELDS = "-SKU";
```
`-` ka matlab **"ye field mat bhejo"**. SKU internal identifier hai, listing me
client ko bhejne ki zaroorat nahi. (Aapke purane code me bhi `.select("-SKU")` tha —
wahi behaviour rakha hai.)

### `searchProducts` ⭐ NAYI API

```js
const safeKeyword = escapeRegex(q);
const searchRegex = new RegExp(safeKeyword, "i");
```
`"i"` flag = **case-insensitive**. `"LAPTOP"`, `"laptop"`, `"LaPtOp"` — sab match.

```js
const filter = {
  ..._buildFilter(queryParams),
  $or: [
    { name: searchRegex },
    { description: searchRegex },
    { category: searchRegex },
    { SKU: searchRegex },
  ],
};
```
`$or` = **in me se KISI EK** field me bhi match ho gaya to product aa jaayega.
Spread `..._buildFilter(...)` se category/price filter bhi **saath me** lag jaate hain.

**Sirf aapke 5 schema fields use kiye hain** — koi naya field nahi.

```js
.maxTimeMS(5000)
```
5 second se zyada query chali to MongoDB use **maar dega**.
Bina iske ek slow query poore DB ko block kar sakti hai.

**Text index kyun nahi use kiya?** MongoDB ka `$text` index bahut fast hota hai,
**par** uske liye model me ek line add karni padti:
```js
productSchema.index({ name: "text", description: "text" });
```
Aapne schema me kuch change na karne ko kaha hai, isliye **regex** use kiya.
Regex ka ek **fayda** bhi hai: **partial match** milta hai (`"lap"` → `"Laptop"`),
jo text index nahi karta (wo poora word maangta hai).

### `updateProduct` — `.save()` vs `findByIdAndUpdate`

```js
const product = await ProductModel.findById(id);
if (!product) throw apiError.notFound("Product");
Object.assign(product, updateData);
await product.save();
```

| | `.save()` | `findByIdAndUpdate()` |
|---|---|---|
| Schema validators | ✅ poore chalte hain | ⚠️ `runValidators: true` dena padta hai |
| `pre('save')` hooks | ✅ chalte hain | ❌ nahi chalte |
| Duplicate check karna | ✅ document paas me hai | ❌ pehle alag query |
| DB calls | 2 (find + save) | 1 |

Humein validation pakki chahiye + SKU check karna hai → **`.save()` sahi hai**.

```js
const skuTaken = await ProductModel.findOne({ SKU: updateData.SKU, _id: { $ne: id } });
```
`$ne` = **not equal**. "Khud ko chhod ke baaki sabme dekho."
Iske bina product **apne hi SKU** se "duplicate" ban jaata. 😅

### `deleteProduct` — hard delete

```js
const product = await ProductModel.findByIdAndDelete(id);
if (!product) throw apiError.notFound("Product");
```
`findByIdAndDelete` **null** deta hai agar product mila hi nahi — isse pata chal
jaata hai ki delete hua ya nahi, alag `findById` nahi karni padi.

> 💡 **Class me batane layak:** Ye **HARD DELETE** hai — data hamesha ke liye gaya.
> Real apps me **SOFT DELETE** karte hain (`isDeleted: true` flag) taaki order history,
> invoice aur analytics na tootein. Uske liye schema me ek `isDeleted` field chahiye —
> abhi hum schema chhed nahi rahe, isliye hard delete rakha hai.

---

## 10. `controller/productController.js`

### Controller ka kaam sirf 3 line ka hai

```js
const createProduct = async (req, res) => {
  const product = await productService.createProduct(req.body);
  res.status(httpStatus.CREATED).json({
    success: true, message: "Product created successfully", data: product,
  });
};
```

**Line 1:** service ko call kiya, `req` se sirf data nikala
**Line 2:** response bheja

Bas. Agar controller 5-6 line se bada ho raha hai → **logic service me jaana chahiye**.

### ⭐ try/catch kahan gaya?

**Aap Express 5 use kar rahe ho** (`package.json`: `express: ^5.2.1`).
Express 5 me async function ka **rejected promise apne aap error handler tak jaata hai**.
Isliye har controller me `try/catch` likhne ki zaroorat **khatam**.

**Express 4 me ye feature nahi tha** — wahan ye wrapper likhna padta tha:
```js
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
```

> 🔴 Aapke purane controller me `try { } catch (err) { console.log("error", err) }` tha.
> Problem: error sirf **terminal me print** hota tha, client ko **koi response hi nahi
> jaata tha** — request hamesha ke liye latak jaati aur browser timeout hota.
> Ye sabse gandi type ki bug hai kyunki error dikhta bhi nahi.

### 🔴 Purane controller ka crash wala bug

```js
// purana productController.js
const createProduct = async (req, res) => {
  const productExist = await ProductModel.findOne({ SKU: req.body.SKU });  // ❌
```
`ProductModel` is file me **kabhi import hi nahi kiya gaya tha!**
Matlab ye API call karte hi `ReferenceError: ProductModel is not defined` deti —
aur wo `catch` me chala jaata jahan sirf `console.log` tha. Client ko kuch nahi milta.

**Ab controller model ko import karta hi nahi** — service karti hai. Layer saaf ho gayi. ✅

### Search me 0 result — **200**, 404 nahi ⭐

```js
const message = products.length
  ? `${meta.totalResults} product(s) found for "${meta.keyword}"`
  : `No products found for "${meta.keyword}"`;
res.status(httpStatus.OK).json({ success: true, message, data: products, meta });
```

**Dono case me 200.** Query successfully chali — "kuch nahi mila" ek **valid answer** hai,
error nahi.

**404 tab do jab resource ka URL hi exist nahi karta:**
```
GET /products/getSingleProduct/507f1f77bcf86cd799439011   (aisa product hai hi nahi) → 404 ✅
GET /products/searchProducts?q=zzzzz                      (search chali, match nahi) → 200 ✅
```

---

## 11. `routes/product.route.js`

### Middleware chain padhna seekho

```js
productRouter.post(
  "/createProduct",
  authMiddleware,                             // 1. Kaun ho?         fail → 401
  authorization("admin", "seller"),           // 2. Allowed ho?      fail → 403
  validationMiddleware(createProductSchema),  // 3. Data sahi hai?   fail → 400
  productController.createProduct             // 4. Ab kaam karo
);
```

Chain **left se right** chalti hai. Koi bhi step `next(error)` kar de → baaki sab
**skip**, seedha error handler.

### 🔴 ORDER badla hai — kyun?

```js
// PURANA
productRouter.post('/createProduct',
  validationMiddleware(...),      // ⬅ validation PEHLE
  authMiddleware,
  authorization("admin","seller"),
  productController.createProduct);
```

**2 problems:**

1. **Bekaar kaam** — jo banda logged in hi nahi hai, uska data check karne ka kya fayda?

2. **Information leak** 🔓 — bina token wala attacker galat body bhej ke aapka **poora
   schema map** kar sakta tha:
   *"achha SKU required hai... category ki enum values ye 5 hain... price number hai..."*
   Ab usko pehle **401** milega, schema ka pata hi nahi chalega.

### `validationMiddleware(schema, "query")` — dusra argument

```js
validationMiddleware(getAllProductsSchema, "query")   // list/search — data query me
validationMiddleware(productIdSchema, "params")       // :id — data URL me
validationMiddleware(updateProductSchema)             // body (default)
```

Ek route pe **do** validationMiddleware bhi lag sakte hain:
```js
productRouter.patch("/updateSingleProduct/:id",
  authMiddleware, authorization("admin","seller"),
  validationMiddleware(productIdSchema, "params"),   // URL ka id check
  validationMiddleware(updateProductSchema),         // body check
  productController.updateSingleProduct);
```

### PATCH vs PUT

| PATCH | PUT |
|---|---|
| **Partial** update | **Poora replace** |
| Jo bheja wahi badlega | Jo nahi bheja wo **UD JAAYEGA** |
| `{ price: 100 }` → sirf price badli | `{ price: 100 }` → name, SKU, category **gayab!** |

Real apps me **99% cases me PATCH** hi sahi hota hai.

### ⚠️ Route ORDER ka rule

Aapke route names **verb-style** hain (`/searchProducts`, `/getSingleProduct/:id`) —
isliye koi clash nahi ho raha. **Lekin** agar REST style pe jaate:

```js
productRouter.get("/:id", ...);      // ⬅ ye pehle likh diya
productRouter.get("/search", ...);   // ⬅ ye KABHI nahi chalega
```

`/products/search` hit karne pe Express samajhta `id = "search"` → ObjectId validation
fail → **400**. Student ghanton debug karta hai ki controller chal kyun nahi raha —
**kyunki dusra route match ho gaya!**

> **RULE:** SPECIFIC routes hamesha DYNAMIC (`:param`) routes se **PEHLE**.

---

## 12. Har API ka Alag Flow

### 1️⃣ CREATE — `POST /products/createProduct`

```
Client (cookie token + body)
  → cookieParser  : req.cookies bana
  → express.json  : req.body bana
  → authMiddleware: token verify, req.user set          fail → 401
  → authorization : role admin/seller?                   fail → 403
  → validation    : Joi body check, extra fields strip   fail → 400
  → controller    : req.body uthaya
  → service       : findOne({SKU}) duplicate check       mila → 409
                    ProductModel.create(data)
  → Mongoose      : name 2-64, price>=0, category enum   fail → 400
  → MongoDB INSERT
  → 201 Created
```

---

### 2️⃣ GET ALL — `GET /products/getAllProducts?category=Books&page=1`

```
Client
  → auth + authorization (teeno role allowed)
  → validation (query): "1" → 1, limit max 100
  → controller
  → service       : _buildFilter() se MongoDB filter
                    Promise.all([find(), countDocuments()])   ← PARALLEL
                    .select("-SKU").sort({_id:-1}).skip().limit().lean()
  → 200 OK + data[] + meta{page, totalPages, hasNextPage...}
```

---

### 3️⃣ SEARCH — `GET /products/searchProducts?q=laptop` ⭐

```
Client
  → auth + authorization
  → validation (query): q required (1-80 chars)
  → controller
  → service:
      escapeRegex(q)              ← ⚠️ ReDoS se bachaav
      new RegExp(safe, "i")       ← case-insensitive
      filter = {
        ...category/price filters,
        $or: [ name, description, category, SKU ]   ← aapke hi 5 fields
      }
      Promise.all([find().maxTimeMS(5000), countDocuments()])
  → 200 OK   (0 result bhi 200 hai! 404 nahi)
```

---

### 4️⃣ GET ONE — `GET /products/getSingleProduct/:id`

```
Client
  → auth + authorization
  → validation (params): ObjectId format (24 hex chars)   fail → 400
  → controller
  → service       : findById()
                    !product → throw apiError.notFound()  → 404
  → 200 OK  |  404 Not Found
```

---

### 5️⃣ UPDATE — `PATCH /products/updateSingleProduct/:id`

```
Client (token + partial body)
  → auth + authorization("admin","seller")
  → validation (params): ObjectId
  → validation (body)  : .min(1) — khaali body allowed nahi
  → controller
  → service:
      findById → 404 agar nahi mila
      SKU badla? → findOne({SKU, _id: {$ne: id}}) → mila to 409
      Object.assign(product, updateData)
      product.save()    ← poori validation chalegi
  → 200 OK
```

---

### 6️⃣ DELETE — `DELETE /products/deleteProduct/:id`

```
Client (token)
  → auth + authorization("admin")   ← sirf admin
  → validation (params): ObjectId
  → controller
  → service       : findByIdAndDelete()
                    null aaya → 404
  → 200 OK
```

---

## 13. 2 Bugs jo aapke code me the 🐛

### 🔴 BUG 1 — `authorization.js` me `return` missing (SECURITY BUG)

```js
// PURANA CODE
const authorization = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      res.status(401).send({ message: "You are not authorized to acces this data" });
      //  ⬆ return NAHI hai!
    }
    next();   // ⬅ ye FIR BHI chal jaata tha
  };
};
```

**Kya hota tha:**
1. Unauthorized user ko 401 response chala jaata
2. **Par `next()` bhi chal jaata** → controller **bhi chalta** → product **create/delete ho jaata!**
3. Phir controller `res.json()` karta → crash: *"Cannot set headers after they are sent to the client"*

**Matlab ek normal `user` role wala banda bhi product delete kar sakta tha.** 🔴

**Fix:**
```js
return next(apiError.forbidden(`Role '${req.user.role}' is not allowed...`));
```

> **SEEKH:** middleware me response bhejne ke baad **HAMESHA `return`** karo.
> `return res.status(...)` ya `return next(error)` — dono chalega.

**Bonus fix:** status **401 → 403** kiya.
`401` = "tum kaun ho? login karo" (login se kaam ban jaayega)
`403` = "ID sahi hai, par entry nahi" (login se **kuch nahi hoga**)
Pehle 401 ki wajah se frontend user ko galti se **logout** kar deta.

---

### 🔴 BUG 2 — `productController.js` me `ProductModel` import hi nahi tha

```js
// PURANA CODE — top pe koi require nahi
const createProduct = async (req, res) => {
  try {
    const productExist = await ProductModel.findOne({ SKU: req.body.SKU });  // ❌ ReferenceError
```

Create Product API **call karte hi crash** hoti — `ReferenceError: ProductModel is not defined`.
Aur wo error `catch` me chala jaata jahan sirf `console.log` tha → **client ko koi
response hi nahi milta**, request timeout ho jaati.

**Fix:** ab controller model ko import karta hi nahi — **service** karti hai.
Layer clean ho gayi. ✅

---

## 14. Top 12 Galtiyan

| # | Galti | Kya hota hai | Sahi tarika |
|---|---|---|---|
| 1 | Middleware me response ke baad `return` nahi | Unauthorized user ka kaam bhi ho jaata hai | `return res...` ya `return next(err)` |
| 2 | Error middleware me 3 parameter | Error handler chalega hi nahi | `(err, req, res, next)` — 4 params |
| 3 | `errorHandler` routes se pehle lagana | Kabhi chalega nahi | Sabse last me |
| 4 | `catch` me sirf `console.log` | Client ko response hi nahi jaata | `next(err)` karo |
| 5 | Route file me DB query | Logic reuse nahi hoga | Service me le jao |
| 6 | Service me `req`/`res` | Sirf HTTP se chalega | Parameter me data lo |
| 7 | `limit` pe `max()` nahi | `?limit=999999` → server crash | `.max(100)` |
| 8 | `new RegExp(userInput)` | **ReDoS** — server freeze | `escapeRegex()` |
| 9 | `if (minPrice)` likhna | `minPrice=0` kaam nahi karega | `if (minPrice !== undefined)` |
| 10 | `/:id` route ko `/search` se pehle | `400 Invalid ObjectId` | Specific routes pehle |
| 11 | Search me 0 result pe 404 | Frontend `.catch()` me chala jaayega | 200 + empty array |
| 12 | Joi aur Mongoose ke rules alag | Confusing errors (jaise 256 vs 264) | Dono same rakho |

### Bonus 3

```js
// 13. res bhejne ke baad next()
res.json(data);
next();                          // ❌ "Cannot set headers after they are sent"

// 14. Joi ka `value` use nahi karna
const { error } = schema.validate(req.body);        // ❌ cleaned data waste
const { value, error } = schema.validate(req.body); // ✅ req.body = value

// 15. Express 5 me req.query assign karna
req.query = cleanedQuery;                           // ❌ CRASH (getter-only)
Object.defineProperty(req, "query", { value, ... }); // ✅
```

---

## 🎯 Ek Line Me Poora Summary

```
Route      = "Kaunsa URL?"           → traffic police
Middleware = "Andar aane doon?"      → bouncer + menu check
Controller = "Kya call karun?"       → waiter
Service    = "Kaam kaise hoga?"      → chef  🧠
Model      = "Data dikhta kaisa?"    → recipe
Utils      = "Chhote tools"          → helpers

Data neeche jaata hai. Error upar aata hai.
Har layer sirf apne neeche wali ko jaanti hai.
```
