// config/hybridsDb.js
const mongoose = require("mongoose");
require("dotenv").config();

// Get the MongoDB connection string from the environment variable
const mongoUrl = process.env.MONGO_URI;
const dbName = "hybrids"; // Specific database for hybrids and their properties

// Create a separate connection for hybrids
const hybridsConnection = mongoose.createConnection(`${mongoUrl}${dbName}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

hybridsConnection.on("connected", () => {
  console.log(`Hybrids database connected: ${dbName}`);
});

hybridsConnection.on("error", (err) => {
  console.error(`Hybrids database connection error: ${err}`);
});

hybridsConnection.on("disconnected", () => {
  console.log("Hybrids database disconnected");
});

// Export the connection for use in models
module.exports = hybridsConnection;
