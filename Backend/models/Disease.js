// models/Disease.js
const mongoose = require("mongoose");
const diseasesConnection = require("../config/diseasesDb");

const DiseaseSchema = new mongoose.Schema({
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
DiseaseSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Use the diseases connection for this model
module.exports = diseasesConnection.model("Disease", DiseaseSchema);
