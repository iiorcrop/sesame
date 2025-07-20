// models/Property.js
const mongoose = require("mongoose");
const varietiesConnection = require("../config/varietiesDb");

const PropertySchema = new mongoose.Schema({
  variety: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Variety",
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

// Create a compound index for variety and name to ensure unique properties per variety
PropertySchema.index({ variety: 1, name: 1 }, { unique: true });

// Update the 'updatedAt' field before saving
PropertySchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Use the varieties connection for this model
module.exports = varietiesConnection.model("Property", PropertySchema);
