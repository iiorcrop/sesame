// models/Hybrid.js
const mongoose = require("mongoose");
const hybridsConnection = require("../config/hybridsDb");

const HybridSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the 'updatedAt' field before saving
HybridSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Use the hybrids connection for this model
module.exports = hybridsConnection.model("Hybrid", HybridSchema);
