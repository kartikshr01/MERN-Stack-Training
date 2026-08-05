const {MongoDB} = require("mongodb");

const url = 'mongodb+srv://kartiksharma2462092_db_user:Uco3WcLrmMAto8nV@cluster0.ekpjjkj.mongodb.net/';

const client = new MongoClient(url);

async function connectDB() {
    await client.connect();

    console.log("DB connected");

    const db = client.db("NewDB")
}