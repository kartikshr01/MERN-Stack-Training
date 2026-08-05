const express = require("express");
const joi = require("joi");
const app = express();
const PORT = 3000;

const authRoutes = require("./Authentication/Authentication");
const authMiddleware = require("./Middleware/AuthMiddleware");

const connectDB = require("./db");
const StudentModel = require("./userModel");
const ProductModel = require("./ProductModel");

app.use(express.json());

app.use("/auth", authRoutes);

// Create Student - POST
// app.post("/createStudent", async (req, res) => {
//   try {
//     const { studentName, email, stream, course, roll } = req.body;

//     const studentData = {
//       studentName: studentName,
//       email: email,
//       stream: stream,
//       course: course,
//       roll: roll,
//     };

//     await StudentModel.create(studentData);

//     res.status(201).json({
//       message: "Student created successfully",
//     });
//   } catch (error) {
//     console.log("Error:", error);

//     res.status(500).json({
//       message: "Failed to create student",
//       error: error.message,
//     });
//   }
// });

// // Students Details - GET

// app.get("/getStudents", async (req, res) => {
//   try {
//     const {page, limit} = req.query;
//     const allStudentsData = await StudentModel.find({}).limit(limit).select("-email");
//     res.status(200).json(allStudentsData);
//   } catch (error) {
//     console.log("Error:", error);
//     res.status(500).json({
//       message: "Failed to fetch students",
//       error: error.message,
//     });
//   }
// });

// // Student details by id - GET

// app.get("/getStudentByID/:id", async (req, res) => {
//   try {
//     const studentDataAccordingToID = await StudentModel.findById(req.params.id);

//     if (!studentDataAccordingToID) {
//       res.status(404).send("NOT AVAILABLE");
//     }

//     res.status(200).json(studentDataAccordingToID);
//   } catch (error) {
//     console.log("Error : ", error);
//     res.status(500).json({
//       message: "Error finding the student",
//       error: error.message,
//     });
//   }
// });

// // Update details - PUT

// app.put("/student/:id", async (req, res) => {
//   try {
//     const updateStudent = await StudentModel.findByIdAndUpdate(
//       req.params.id,
//       {
//         $set: req.body,
//       },
//       { new: true, runValidators: true }
//     );

//     if (!updateStudent) {
//       return res.status(404).json({
//         message: "Student not found",
//       });
//     }

//     res.status(200).json(updateStudent);
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({
//       message: "Failed to update student",
//     });
//   }
// });

// // Delete student - DELETE

// app.delete("/deleteStudent/:id", async (req, res) => {
//   try {
//     await StudentModel.findByIdAndDelete(req.params.id);

//     res.status(200).json({
//       message: "Student deleted successfully",
//     });
//   } catch (error) {
//     console.log(error);
//   }
// });

// CREATE PRODUCT

app.post("/createProduct", authMiddleware, async (req, res) => {
  try {
    const validationSchema = joi.object({
      productName: joi.string().required().min(2).max(128),
      price: joi.number().required().min(0),
      category: joi.string().required().min(2).max(128),
      SKU: joi.string().required().min(2).max(128),
      description: joi.string().required().min(2).max(256),
    });

    const { error, value } = validationSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        message: "Invalid input data",
        details: error.details[0].message,
      });
    }

    const { productName, price, description, category, SKU } = value;

    const existingProduct = await ProductModel.findOne({ SKU });
    if (existingProduct) {
      return res.status(409).json({ message: "Product SKU already exists." });
    }

    const newProduct = await ProductModel.create({
      productName,
      price,
      description,
      category,
      SKU,
    });

    return res.status(201).json({
      message: "PRODUCT CREATED SUCCESSFULLY",
      data: newProduct,
    });
  } catch (error) {
    console.error("Error: ", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// GET PRODUCTS
app.get("/products", authMiddleware, async(req,res) => {
  try {
    const allProducts = await ProductModel.find({});
    if(allProducts.length === 0){
      return res.status(404).json({
        message: "Products not found!"
      })
    }
    res.status(200).json({
      message: "Products found.",
      data: allProducts
    })
  }
  catch(error) {
    console.log(error);
    res.status(500).send("Error: ", error.message);
  }
});

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.log("Database connection failed:", error);
  });
