// config/pestsDb.js
const mongoose = require("mongoose");
require("dotenv").config();

// Get the MongoDB connection string from the environment variable
const mongoUrl = process.env.MONGO_URI;
const dbName = "pests"; // Specific database for pests and their properties

// Create a separate connection for pests
const pestsConnection = mongoose.createConnection(`${mongoUrl}${dbName}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

pestsConnection.on("connected", () => {
  console.log(`pests database connected: ${dbName}`);
});

pestsConnection.on("error", (err) => {
  console.error(`pests database connection error: ${err}`);
});

pestsConnection.on("disconnected", () => {
  console.log("pests database disconnected");
});

// Export the connection for use in models
module.exports = pestsConnection;
