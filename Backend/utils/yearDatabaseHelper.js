// This file provides utility functions for creating and connecting to year-specific databases
const mongoose = require("mongoose");
const { MongoClient } = require("mongodb");
require("dotenv").config();

// Create a map to store connections by year
const yearConnections = new Map();

// Get the MongoDB connection string from the environment variable
const mongoUrl = process.env.MONGO_URI;

/**
 * Creates a connection to a specific year's database
 * @param {string} year - The year for the database (e.g., "2025")
 * @returns {Promise<mongoose.Connection>} - A Mongoose connection to the year database
 */
const getYearDbConnection = async (year) => {
  // If we already have this connection, return it
  if (yearConnections.has(year)) {
    return yearConnections.get(year);
  }

  try {
    // Create a new connection for this year
    const dbName = `marketData${year}`;

    // Create a new connection
    const connection = mongoose.createConnection(`${mongoUrl}${dbName}`);

    // Add connection to the map
    yearConnections.set(year, connection);

    console.log(`Connected to year database: ${dbName}`);
    return connection;
  } catch (error) {
    console.error(`Error connecting to year database for ${year}:`, error);
    throw error;
  }
};

/**
 * Gets a model for market data specific to a year
 * @param {string} year - The year for the database
 * @returns {Promise<mongoose.Model>} - A Mongoose model for market data
 */
const getMarketDataModel = async (year) => {
  const connection = await getYearDbConnection(year);

  try {
    // First try to get the model if it's already registered
    return connection.model("MarketData");
  } catch (error) {
    // Model doesn't exist yet, so define the schema and create it
    const MarketDataSchema = new mongoose.Schema({
      stateName: { type: String, required: true },
      districtName: { type: String, required: true },
      marketName: { type: String, required: true },
      variety: { type: String },
      group: { type: String }, // Added for 'Group' column
      arrivals: { type: String }, // Stored as string to preserve original format
      minPrice: { type: Number },
      maxPrice: { type: Number },
      modalPrice: { type: Number },
      reportedDate: { type: Date },
      importedFrom: { type: String, default: "CSV" },
      createdAt: { type: Date, default: Date.now },
    });

    // Create and return the model for this connection
    return connection.model("MarketData", MarketDataSchema);
  }
};

/**
 * Verifies if a specific year database exists, and creates it if it doesn't
 * @param {string} year - The year to check/create
 * @returns {Promise<boolean>} - True if the database exists or was created
 */
const verifyYearDatabase = async (year) => {
  const client = new MongoClient(mongoUrl);

  try {
    await client.connect();
    const dbName = `marketData${year}`;
    const admin = client.db("admin");

    // Get list of databases
    const dbs = await admin.command({ listDatabases: 1 });

    // Check if our database exists
    const dbExists = dbs.databases.some((db) => db.name === dbName);

    if (!dbExists) {
      // Create database by writing something to it
      const db = client.db(dbName);
      await db
        .collection("marketData")
        .insertOne({ _id: "init", created: new Date() });
      console.log(`Created new database: ${dbName}`);
    }

    return true;
  } catch (error) {
    console.error(`Error verifying year database for ${year}:`, error);
    throw error;
  } finally {
    await client.close();
  }
};

/**
 * Close a specific year's database connection
 * @param {string} year - The year to close connection for
 */
const closeYearConnection = async (year) => {
  if (yearConnections.has(year)) {
    const connection = yearConnections.get(year);
    await connection.close();
    yearConnections.delete(year);
    console.log(`Closed connection to year database: marketData${year}`);
  }
};

/**
 * Close all year database connections
 */
const closeAllYearConnections = async () => {
  for (const [year, connection] of yearConnections.entries()) {
    await connection.close();
    console.log(`Closed connection to year database: marketData${year}`);
  }
  yearConnections.clear();
  console.log("All year database connections closed");
};

module.exports = {
  getYearDbConnection,
  getMarketDataModel,
  verifyYearDatabase,
  closeYearConnection,
  closeAllYearConnections,
};
