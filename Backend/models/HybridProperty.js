// models/HybridProperty.js
const mongoose = require("mongoose");
const hybridsConnection = require("../config/hybridsDb");

const HybridPropertySchema = new mongoose.Schema({
  hybrid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hybrid",
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  valueType: {
    type: String,
    enum: ["text", "image"],
    default: "text",
    required: true,
  },
  value: {
    type: String,
    required: true,
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

// Create a compound index for hybrid and name to ensure unique properties per hybrid
HybridPropertySchema.index({ hybrid: 1, name: 1 }, { unique: true });

// Update the 'updatedAt' field before saving
HybridPropertySchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Use the hybrids connection for this model
module.exports = hybridsConnection.model(
  "HybridProperty",
  HybridPropertySchema
);
