// models/Variety.js
const mongoose = require("mongoose");
const varietiesConnection = require("../config/varietiesDb");

const VarietySchema = new mongoose.Schema({
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
VarietySchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Use the varieties connection for this model
module.exports = varietiesConnection.model("Variety", VarietySchema);
