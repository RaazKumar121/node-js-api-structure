const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
async function connect() {
  mongoose.set("strictQuery", true);
  const db = await mongoose.connect(process.env.MONGODB_URL_D);
  console.log("Database connected");
  return db;
}

module.exports = connect;
