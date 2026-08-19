const express = require("express");
const app = express();

const cookieParser = require("cookie-parser");

const reviewRouter = require("./src/routes/review.route");
const staffRouter = require("./src/routes/staff.route");
const connectDB = require("./src/config/db");

app.use(express.json());
app.use(cookieParser());

app.use("/review", reviewRouter);
app.use("/staff", staffRouter);

const {
  notFound,
  errorHandler
} = require("./src/middlewares/errorHandler");

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is listening on ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("Error connecting to the database!", err);
  });