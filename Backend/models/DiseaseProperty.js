// models/DiseaseProperty.js
const mongoose = require("mongoose");
const diseasesConnection = require("../config/diseasesDb");

const DiseasePropertySchema = new mongoose.Schema({
  disease: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Disease",
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

// Create a compound index for disease and name to ensure unique properties per disease
DiseasePropertySchema.index({ disease: 1, name: 1 }, { unique: true });

// Update the 'updatedAt' field before saving
DiseasePropertySchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Use the diseases connection for this model
module.exports = diseasesConnection.model(
  "DiseaseProperty",
  DiseasePropertySchema
);
