// models/pest.js
const mongoose = require("mongoose");
const pestsConnection = require("../config/pestsModelDb");

const pestSchema = new mongoose.Schema({
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
pestSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Use the pests connection for this model
module.exports = pestsConnection.model("PestModel", pestSchema);
