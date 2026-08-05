const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    studentName: {
      type: String,
      minLength: 2,
      maxLength: 128,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      minLength: 12,
      maxLength: 128,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
    },
    stream: {
      type: String,
      enum: ["CSE", "ECE", "IT", "MECH"],
      minLength: 3,
      maxLength: 30,
      required: true,
      trim: true,
      uppercase: true,
    },
    course: {
      type: String,
      uppercase: true,
      enum: ["MERN", "JAVA", "Cyber Security"],
      default: "MERN",
      minLength: 2,
      maxLength: 128,
      required: true,
      trim: true,
    },
    roll: {
      type: Number,
      minLength: 3,
      maxLength: 6,
      required: true,
    },
  },
  {
    timestamps: true,
    strict: true,
  },
);

const StudentModel = mongoose.model("Student", studentSchema);

module.exports = StudentModel;
