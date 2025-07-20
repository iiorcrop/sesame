const mongoose = require("mongoose");
require("dotenv").config();

// Create a separate connection for the pests database
const connectPestsDB = async () => {
  try {
    // Use the same MongoDB cluster but connect to a different database named 'pestDB'
    const mongoUri = process.env.MONGO_URI;
    // Remove trailing slash if present and add pestDB database name
    const pestDbUri = mongoUri.endsWith("/")
      ? `${mongoUri}pestDB`
      : `${mongoUri}/pestDB`;

    const pestConnection = await mongoose.createConnection(pestDbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Pest Database Connected...");
    // Log the connected database name
    console.log("Connected to pest database:", pestConnection.name);

    return pestConnection;
  } catch (error) {
    console.error("Error connecting to pest database:", error.message);
    process.exit(1);
  }
};

module.exports = connectPestsDB;
