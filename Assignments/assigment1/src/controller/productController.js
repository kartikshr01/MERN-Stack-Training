// ============================================================================
// src/controller/productController.js
//
// CONTROLLER LAYER = TRANSLATOR 🗣️
//
// Iska SIRF 3 kaam hai:
//   1. Request me se data nikalna (req.body / req.query / req.params)
//   2. Sahi service function ko call karna
//   3. Response bhejna (SAHI status code ke saath)
//
// ❌ Controller me KABHI mat likhna: ProductModel.find(), duplicate check,
//    business rules, price calculation. Wo sab SERVICE ka kaam hai.
//
// Test: agar controller 5-6 line se bada ho raha hai -> logic service me jaana chahiye.
//
// ⚠️ try/catch kahan gaya?
//    Aap EXPRESS 5 use kar rahe ho (package.json: express ^5.2.1).
//    Express 5 me async function ka REJECTED PROMISE apne aap error handler
//    tak chala jaata hai. Isliye har controller me try/catch likhne ki
//    zaroorat KHATAM ho gayi.
//    (Express 4 me ye feature nahi tha — wahan catchAsync wrapper likhna padta tha.
//     README me wo pattern bhi diya hua hai.)
// ============================================================================

const productService = require("../service/productService");
const httpStatus = require("../utils/httpStatus");

/**
 * @desc    Naya product banao
 * @route   POST /products/createProduct
 * @access  Private (admin, seller)
 */
const createProduct = async (req, res) => {
  const product = await productService.createProduct(req.body);

  // 201 CREATED, 200 nahi! Kyunki nayi resource BANI hai.
  res.status(httpStatus.CREATED).json({
    success: true,
    message: "Product created successfully",
    data: product,
  });
};

/**
 * @desc    Saare products — filter + sort + pagination ke saath
 * @route   GET /products/getAllProducts
 * @access  Private (admin, seller, user)
 */
const getAllProducts = async (req, res) => {
  // req.query yahan SAFE hai kyunki validationMiddleware ne already
  // stripUnknown karke saaf kar diya hai + strings ko numbers bana diya hai.
  const { products, meta } = await productService.getAllProducts(req.query);

  res.status(httpStatus.OK).json({
    success: true,
    message: "Products fetched successfully",
    data: products,
    meta, // pagination info alag key me — data array saaf rehta hai
  });
};

/**
 * @desc    Keyword se products search karo
 * @route   GET /products/searchProducts?q=laptop
 * @access  Private (admin, seller, user)
 */
const searchProducts = async (req, res) => {
  const { products, meta } = await productService.searchProducts(req.query);

  // ⭐ Search me 0 result milna ERROR NAHI hai. 404 MAT bhejna!
  //    Query successfully chali, bas match nahi mila — ye 200 with empty array hai.
  const message = products.length
    ? `${meta.totalResults} product(s) found for "${meta.keyword}"`
    : `No products found for "${meta.keyword}"`;

  res.status(httpStatus.OK).json({
    success: true,
    message,
    data: products,
    meta,
  });
};

/**
 * @desc    Ek product ID se
 * @route   GET /products/getSingleProduct/:id
 * @access  Private (admin, seller, user)
 */
const getSingleProduct = async (req, res) => {
  const product = await productService.getProductById(req.params.id);

  res.status(httpStatus.OK).json({
    success: true,
    message: "Product fetched successfully",
    data: product,
  });
};

/**
 * @desc    Product update karo (partial update)
 * @route   PATCH /products/updateSingleProduct/:id
 * @access  Private (admin, seller)
 */
const updateSingleProduct = async (req, res) => {
  const product = await productService.updateProduct(req.params.id, req.body);

  res.status(httpStatus.OK).json({
    success: true,
    message: "Product updated successfully",
    data: product,
  });
};

/**
 * @desc    Product delete karo
 * @route   DELETE /products/deleteProduct/:id
 * @access  Private (admin)
 */
const deleteProduct = async (req, res) => {
  await productService.deleteProduct(req.params.id);

  // Delete ke baad data wapas bhejne ka koi matlab nahi — wo ab exist hi nahi karta.
  // data: null bhej rahe hain taaki response ka shape sab jagah same rahe.
  res.status(httpStatus.OK).json({
    success: true,
    message: "Product deleted successfully",
    data: null,
  });
};

module.exports = {
  createProduct,
  getAllProducts,
  searchProducts,
  getSingleProduct,
  updateSingleProduct,
  deleteProduct,
};
