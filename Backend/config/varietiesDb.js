// config/varietiesDb.js
const mongoose = require("mongoose");
require("dotenv").config();

// Get the MongoDB connection string from the environment variable
const mongoUrl = process.env.MONGO_URI;
const dbName = "varieties"; // Specific database for varieties and properties

// Create a separate connection for varieties
const varietiesConnection = mongoose.createConnection(`${mongoUrl}${dbName}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

varietiesConnection.on("connected", () => {
  console.log(`Varieties database connected: ${dbName}`);
});

varietiesConnection.on("error", (err) => {
  console.error(`Varieties database connection error: ${err}`);
});

varietiesConnection.on("disconnected", () => {
  console.log("Varieties database disconnected");
});

// Export the connection for use in models
module.exports = varietiesConnection;
