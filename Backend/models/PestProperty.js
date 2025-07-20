// models/pestProperty.js
const mongoose = require("mongoose");
const pestsConnection = require("../config/pestsModelDb");

const pestPropertySchema = new mongoose.Schema({
  pest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "pest",
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

// Create a compound index for pest and name to ensure unique properties per pest
pestPropertySchema.index({ pest: 1, name: 1 }, { unique: true });

// Update the 'updatedAt' field before saving
pestPropertySchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Use the pests connection for this model
module.exports = pestsConnection.model("pestProperty", pestPropertySchema);
