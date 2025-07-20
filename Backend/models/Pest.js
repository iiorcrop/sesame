const mongoose = require("mongoose");
const connectPestsDB = require("../config/pestsDb");

// We'll initialize this connection when the application starts
let pestDb;

// Define the Pest schema
const PestSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  // You can add additional fields for pest data as needed, for example:
  // status: { type: String, required: true }, // e.g., "active", "inactive"
  // severity: { type: Number, required: true }, // A rating scale of severity (optional)
});

// Initialize the model with the pestDb connection and export it
const initializePestModel = async () => {
  if (!pestDb) {
    pestDb = await connectPestsDB();
  }
  return pestDb.model("Pest", PestSchema);
};

module.exports = { initializePestModel };
