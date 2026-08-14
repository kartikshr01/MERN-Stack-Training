// ============================================================================
// src/service/productService.js
//
// SERVICE LAYER = poore project ka DIMAAG 🧠
//
// Rules (inko todna mat):
//   ✅ Service me: DB queries, business logic, duplicate check, calculations
//   ❌ Service me: req, res, next, res.status() — HTTP ka naam bhi nahi
//
// Kyun: kal ko yahi logic ek CRON job se, CLI script se, ya admin panel se
//       call karna pade to service jaisi ki waisi chalegi. Agar isme req/res
//       ghusa diya to sirf HTTP se hi chalegi — code phans gaya.
//
// Service error THROW karti hai (res.send nahi karti). Error apne aap
// global errorHandler tak pahunch jaata hai.
// ============================================================================

const ProductModel = require("../model/productModel");
const apiError = require("../utils/apiError");
const { escapeRegex, buildSort, buildPaginationMeta } = require("../utils/helpers");

// Sort sirf in fields pe allow — Joi bhi check karta hai, yahan bhi.
// Do jagah check karna "defense in depth" hai (ek layer fail ho to dusri bachaaye).
const SORTABLE_FIELDS = ["name", "price", "category"];

// SKU internal identifier hai — listing me client ko bhejne ki zaroorat nahi.
// (Aapke purane code me bhi `.select("-SKU")` tha, wahi behaviour rakha hai.)
const LIST_FIELDS = "-SKU";

// ---------------------------------------------------------------------------
// Internal helper: query params se MongoDB ka filter object banana
// `_` prefix ka matlab: "ye function sirf isi file ke andar use hota hai"
// (JavaScript isko force nahi karta, par ye ek strong convention hai)
// ---------------------------------------------------------------------------
const _buildFilter = ({ category, minPrice, maxPrice }) => {
  const filter = {};

  // category enum hai, isliye EXACT match — regex ki zaroorat nahi
  if (category) filter.category = category;

  // Price range banao. $gte = greater than or equal, $lte = less than or equal
  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined) filter.price.$gte = minPrice;
    if (maxPrice !== undefined) filter.price.$lte = maxPrice;
  }

  // ⚠️ `!== undefined` likha hai, sirf `if (minPrice)` nahi — KYUN?
  //    Kyunki 0 bhi FALSY hai! minPrice=0 ek valid filter hai par
  //    `if (0)` false dega aur filter lagega hi nahi. Ye bug bahut common hai.

  return filter;
};

// ============================================================================
// 1) CREATE PRODUCT
// ============================================================================
const createProduct = async (data) => {
  // SKU unique hona chahiye — pehle check kar lo taaki user ko SAAF message mile
  const productExist = await ProductModel.findOne({ SKU: data.SKU });

  if (productExist) {
    // 409 CONFLICT, 400 nahi. Request bilkul sahi thi, bas cheez pehle se hai.
    throw apiError.conflict(`Product with SKU '${data.SKU}' already exists`);
  }

  // ⚠️ Ye check 100% pakka nahi hai — do requests EK SAATH aa jaayein to dono
  //    ka findOne null dega aur dono create karne chalengi (RACE CONDITION).
  //    Bachaata kaun hai? Model ka `unique: true` index.
  //    Wo error code 11000 dega, jise errorHandler 409 me badal deta hai.
  //    Matlab: ye check achhe MESSAGE ke liye hai, SAFETY index deta hai.

  const newProduct = await ProductModel.create(data);
  return newProduct;
};

// ============================================================================
// 2) GET ALL PRODUCTS  (filter + sort + pagination)
// ============================================================================
const getAllProducts = async (queryParams) => {
  const { page, limit, sortBy } = queryParams;

  const filter = _buildFilter(queryParams);
  const sort = buildSort(sortBy, SORTABLE_FIELDS);

  // Pagination ka math:
  //   page 1 -> skip 0   (pehle 10)
  //   page 2 -> skip 10  (agle 10)
  //   page 3 -> skip 20
  const skip = (page - 1) * limit;

  // ⭐ Promise.all => dono queries EK SAATH chalengi (parallel), ek ke baad ek nahi.
  //    Sequential: 40ms + 30ms = 70ms
  //    Parallel:   max(40, 30) = 40ms       <- muft ki speed
  const [products, totalResults] = await Promise.all([
    ProductModel.find(filter)
      .select(LIST_FIELDS)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      // .lean() => Mongoose document ki jagah plain JS object do.
      // 2-3x fast + kam memory, kyunki Mongoose change-tracking wrapper nahi banata.
      // ⚠️ Lekin .lean() ke baad .save() aur document methods nahi milte.
      //    Rule: sirf PADHNA hai -> .lean() lagao. MODIFY karke save karna hai -> mat lagao.
      .lean(),

    ProductModel.countDocuments(filter),
  ]);

  return {
    products,
    meta: buildPaginationMeta({ page, limit, totalResults }),
  };
};

// ============================================================================
// 3) SEARCH PRODUCTS  ⭐ NAYI API
//
// Aapke schema me text index nahi hai (aur hum schema chhed nahi rahe),
// isliye REGEX based search use kar rahe hain. Iska fayda ye hai ki
// PARTIAL match bhi milta hai — "lap" likho to "Laptop" mil jaayega.
// ============================================================================
const searchProducts = async (queryParams) => {
  const { q, page, limit, sortBy } = queryParams;

  // ⚠️⚠️ SECURITY: escapeRegex ke bina user `(a+)+$` bhej ke ReDoS kar sakta hai.
  //       Node SINGLE-THREADED hai — ek hi request poora server freeze kar degi.
  //       Ye line optional nahi hai.
  const safeKeyword = escapeRegex(q);

  // 'i' flag = case-insensitive. "LAPTOP", "laptop", "LaPtOp" — sab match
  const searchRegex = new RegExp(safeKeyword, "i");

  const filter = {
    // Pehle normal filters (category, price range) lagao...
    ..._buildFilter(queryParams),

    // ...phir keyword search.
    // $or => in me se KISI EK field me bhi match ho gaya to product aa jaayega.
    // ⚠️ Sirf aapke schema wale fields use kiye hain — koi naya field nahi.
    $or: [
      { name: searchRegex },        // sabse zaroori
      { description: searchRegex },
      { category: searchRegex },    // "Book" likho to Books category ke sab aa jaayenge
      { SKU: searchRegex },         // internal lookup ke liye (admin/seller ko kaam aata hai)
    ],
  };

  const sort = buildSort(sortBy, SORTABLE_FIELDS);
  const skip = (page - 1) * limit;

  const [products, totalResults] = await Promise.all([
    ProductModel.find(filter)
      .select(LIST_FIELDS)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      // .maxTimeMS(5000) => 5 second se zyada query chali to MongoDB use MAAR dega.
      // Bina iske ek slow query poore DB ko block kar sakti hai.
      .maxTimeMS(5000)
      .lean(),

    ProductModel.countDocuments(filter).maxTimeMS(5000),
  ]);

  return {
    products,
    meta: {
      ...buildPaginationMeta({ page, limit, totalResults }),
      keyword: q, // response me wapas bhejna — frontend "results for X" dikha sake
    },
  };
};

// ============================================================================
// 4) GET SINGLE PRODUCT
// ============================================================================
const getProductById = async (id) => {
  const product = await ProductModel.findById(id);

  // ⭐ "not found" ka faisla SERVICE me ho raha hai, controller me nahi.
  //    Isse har controller me `if (!product) return res.status(404)...` likhna nahi padta.
  if (!product) {
    throw apiError.notFound("Product");
  }

  return product;
};

// ============================================================================
// 5) UPDATE PRODUCT
// ============================================================================
const updateProduct = async (id, updateData) => {
  const product = await ProductModel.findById(id);
  if (!product) {
    throw apiError.notFound("Product");
  }

  // Agar SKU badla ja raha hai to check karo ki wo KISI AUR product ka to nahi
  if (updateData.SKU && updateData.SKU !== product.SKU) {
    const skuTaken = await ProductModel.findOne({
      SKU: updateData.SKU,
      // $ne = not equal. Khud ko chhod ke baaki sabme dekho.
      // Iske bina product apne hi SKU se "duplicate" ban jaata.
      _id: { $ne: id },
    });

    if (skuTaken) {
      throw apiError.conflict(`SKU '${updateData.SKU}' is already used by another product`);
    }
  }

  // Object.assign => updateData ki saari keys product document pe copy kar do
  Object.assign(product, updateData);

  // ⭐ .save() use kiya, findByIdAndUpdate NAHI. Kyun?
  //    - .save() se POORI schema validation chalti hai (minLength, enum, min...)
  //    - .save() se pre('save') hooks chalte hain (aage kabhi add karoge to kaam aayenge)
  //    findByIdAndUpdate me by default validators SKIP ho jaate hain —
  //    { runValidators: true } alag se dena padta hai, aur save hooks fir bhi nahi chalte.
  await product.save();

  return product;
};

// ============================================================================
// 6) DELETE PRODUCT
// ============================================================================
const deleteProduct = async (id) => {
  const product = await ProductModel.findByIdAndDelete(id);

  // findByIdAndDelete null deta hai agar product mila hi nahi.
  // Isse pata chal jaata hai ki delete hua ya nahi — isliye alag findById nahi karni padi.
  if (!product) {
    throw apiError.notFound("Product");
  }

  return product;

  // 💡 NOTE (class me batane layak):
  //    Ye HARD DELETE hai — data DB se hamesha ke liye ud gaya.
  //    Real apps me SOFT DELETE karte hain (isDeleted: true flag) taaki
  //    order history / invoice / analytics na tootein.
  //    Uske liye schema me ek `isDeleted` field chahiye hoti — abhi hum
  //    schema me koi change nahi kar rahe, isliye hard delete rakha hai.
};

module.exports = {
  createProduct,
  getAllProducts,
  searchProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
