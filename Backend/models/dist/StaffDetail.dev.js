"use strict";

var mongoose = require("mongoose");

var staffConnection = require("../config/staffDb");

var StaffDetailSchema = new mongoose.Schema({
  userID: {
    type: String,
    required: true,
    index: true
  },
  // Identify staff user
  data: {
    type: Object,
    required: true
  },
  // Flexible: stores all submitted fields
  submittedAt: {
    type: Date,
    "default": Date.now
  },
  position: {
    type: Number,
    "default": 0
  },
  // For ordering within department
  subposition: {
    type: Number,
    "default": 0
  } // For ordering within division

}, {
  timestamps: true
});
module.exports = staffConnection.model("StaffDetail", StaffDetailSchema);