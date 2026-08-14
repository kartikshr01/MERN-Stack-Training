const mongoose = require("mongoose");


const addressSchema = new mongoose.Schema({
  street:{
    type:String,
    maxLength:264,

  },
  state:{
    type:String,
    maxLength:128,
    required:true
  },
  country:{
    type:String,
    maxLength:128,
    required:true,
  }
})
const studentSchema= new mongoose.Schema({
    name:{
        type:String,
        minLength:2,
        maxLength:64,
        required:true,
        trim:true,
        
    },
    skills:{
        type:[String],
        // required:true
    },
    course:{
        type:String,
        enum:["MERN","JAVA"],
        required:true,
        default:"MERN",
        trim:true
    },
    stream:{
        type:String,
        minLength:2,
        maxLength:64,
        trim:true,
        required:true,
        uppercase:true
    },
    roll:{
        type:Number,
        min:1,
        max:1000,
        required:true,
        unique:true,

    },
    gender:{
        type:String,
        validate(value){
            if(!["male","female","Others"].includes(useDeferredValue)){
                throw new Error({mesage:"This gender is not allowed"})
            }
        }
    },
    email:{
        type:String,
        unique:true,
        maxLength:264,
        required:true
    },
   address:addressSchema
},{timestamps:true,strict:true});

const StudentModel = mongoose.model("student",studentSchema);

module.exports=StudentModel;