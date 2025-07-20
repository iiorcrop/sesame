// config/diseasesDb.js
const mongoose = require("mongoose");
require("dotenv").config();

// Get the MongoDB connection string from the environment variable
const mongoUrl = process.env.MONGO_URI;

const dbName = "diseases"; // Specific database for diseases and their properties

// Create a separate connection for diseases
const diseasesConnection = mongoose.createConnection(`${mongoUrl}${dbName}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

diseasesConnection.on("connected", () => {
  console.log(`Diseases database connected: ${dbName}`);
});

diseasesConnection.on("error", (err) => {
  console.error(`Diseases database connection error: ${err}`);
});

diseasesConnection.on("disconnected", () => {
  console.log("Diseases database disconnected");
});

// Export the connection for use in models
module.exports = diseasesConnection;
