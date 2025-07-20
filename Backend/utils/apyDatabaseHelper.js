// This file provides utility functions for creating and connecting to APY year-specific databases
const mongoose = require("mongoose");
const { MongoClient } = require("mongodb");
require("dotenv").config();

// Create a map to store connections by year
const apyYearConnections = new Map();

// Get the MongoDB connection string from the environment variable
const mongoUrl = process.env.MONGO_URI;

/**
 * Creates a connection to a specific APY year's database
 * @param {string} year - The year for the database (e.g., "2022-2023")
 * @returns {Promise<mongoose.Connection>} - A Mongoose connection to the year database
 */
const getAPYYearDbConnection = async (year) => {
  // If we already have this connection, return it
  if (apyYearConnections.has(year)) {
    return apyYearConnections.get(year);
  }

  try {
    // Format the year for use in database name (replace dash with underscore)
    const formattedYear = year.replace("-", "_");

    // Create a new connection for this year
    const dbName = `apyData${formattedYear}`;

    // Create a new connection
    const connection = mongoose.createConnection(`${mongoUrl}${dbName}`);

    // Add connection to the map
    apyYearConnections.set(year, connection);

    console.log(`Connected to APY year database: ${dbName}`);
    return connection;
  } catch (error) {
    console.error(`Error connecting to APY year database for ${year}:`, error);
    throw error;
  }
};

/**
 * Gets a model for APY data specific to a year
 * @param {string} year - The year for the database
 * @returns {Promise<mongoose.Model>} - A Mongoose model for APY data
 */
const getAPYDataModel = async (year) => {
  const connection = await getAPYYearDbConnection(year);

  try {
    // First try to get the model if it's already registered
    return connection.model("APYData");
  } catch (error) {
    // Model doesn't exist yet, so define the schema and create it
    const APYDataSchema = new mongoose.Schema({
      state: { type: String, required: true },
      area: { type: Number }, // Area in '000 Hectare
      production: { type: Number }, // Production in '000 Tonne
      productivity: { type: Number }, // Productivity in Kg./Hectare
      importedFrom: { type: String, default: "Excel" },
      createdAt: { type: Date, default: Date.now },
    });

    // Create and return the model for this connection
    return connection.model("APYData", APYDataSchema);
  }
};

/**
 * Verifies if a specific APY year database exists, and creates it if it doesn't
 * @param {string} year - The year to check/create
 * @returns {Promise<boolean>} - True if the database exists or was created
 */
const verifyAPYYearDatabase = async (year) => {
  const client = new MongoClient(mongoUrl);

  try {
    await client.connect();
    const formattedYear = year.replace("-", "_");
    const dbName = `apyData${formattedYear}`;
    const admin = client.db("admin");

    // Get list of databases
    const dbs = await admin.command({ listDatabases: 1 });

    // Check if our database exists
    const dbExists = dbs.databases.some((db) => db.name === dbName);

    if (!dbExists) {
      // Create database by writing something to it
      const db = client.db(dbName);
      await db
        .collection("apyData")
        .insertOne({ _id: "init", created: new Date() });
      console.log(`Created new APY database: ${dbName}`);
    }

    return true;
  } catch (error) {
    console.error(`Error verifying APY year database for ${year}:`, error);
    throw error;
  } finally {
    await client.close();
  }
};

module.exports = {
  getAPYYearDbConnection,
  getAPYDataModel,
  verifyAPYYearDatabase,
};
