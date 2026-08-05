const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const mongoose = require("mongoose");

const url = 'mongodb+srv://kartiksharma2462092_db_user:Uco3WcLrmMAto8nV@cluster0.ekpjjkj.mongodb.net/';

const connectDB = async() => {
    try {
        await mongoose.connect(url);
        console.log("Database connection successfully.")
    }   
    catch(error) {
        console.error("Database connection failed: " + error.message);
    }
};

module.exports = connectDB;


// const mongoose = require('mongoose');

// const url = 'mongodb+srv://kartiksharma2462092_db_user:Uco3WcLrmMAto8nV@cluster0.ekpjjkj.mongodb.net/TechnoDB';

// const connectDB = async () => {
//     try {
//         await mongoose.connect(url);
//         console.log('Database Connected Successfully');
//     } catch (error) {
//         console.error('Database connection failed:', error.message);
//     }
// };

// module.exports = connectDB;
