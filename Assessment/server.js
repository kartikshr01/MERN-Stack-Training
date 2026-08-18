const ReviewModel = require("./src/models/reviewModel");

const connectDB = require("./src/config/db");

connectDB();

async function addReview() {
  await ReviewModel.create({
    title: "Bahut accha product",
    comment: "Delivery fast thi aur quality bhi acchi hai",
    rating: 5,
    reviewerName: "Rahul",
  });
}

addReview();
