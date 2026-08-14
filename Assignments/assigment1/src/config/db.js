// step 1 -> npm install dns;
// step 2 -> db.js --> 

const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);



const mongoose = require('mongoose');
require("dotenv").config();
const mongo_URL = process.env.db_URL;
const url=mongo_URL;


const connectDB = async()=>{
    await mongoose.connect(url);
    console.log("database connection stablished")
};

module.exports = connectDB;