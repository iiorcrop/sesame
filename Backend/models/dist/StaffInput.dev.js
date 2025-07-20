"use strict";

var staffConnection = require("../config/staffDb");

var mongoose = require("mongoose");

var staffInputSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Title is required"],
    trim: true,
    maxlength: [50, "Title must be at most 50 characters"]
  },
  type: {
    type: String,
    required: [true, "Type is required"],
    trim: true,
    maxlength: [30, "Type must be at most 30 characters"],
    "enum": ["text", "email", "dropdown", "number", "date", "password", "tel", "url"]
  },
  position: {
    type: Number,
    "default": 0,
    required: true,
    min: 0
  },
  options: [{
    type: String // Only used for dropdown type

  }],
  required: {
    type: Boolean,
    "default": false
  }
}, {
  timestamps: true
});
module.exports = staffConnection.model("StaffInput", staffInputSchema);