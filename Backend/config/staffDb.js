// config/staffDb.js
const mongoose = require("mongoose");
require("dotenv").config();

// Get the MongoDB connection string from the environment variable
const mongoUrl = process.env.MONGO_URI;
const dbName = "staff"; // Specific database for staff and their properties

// Create a separate connection for staff
const staffConnection = mongoose.createConnection(`${mongoUrl}${dbName}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

staffConnection.on("connected", () => {
  console.log(`Staff database connected: ${dbName}`);
});

staffConnection.on("error", (err) => {
  console.error(`Staff database connection error: ${err}`);
});

staffConnection.on("disconnected", () => {
  console.log("Staff database disconnected");
});

// Export the connection for use in models
module.exports = staffConnection;
