"use strict";

var mongoose = require("mongoose");

var AdminUserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    "enum": ["superadmin", "admin"],
    "default": "admin",
    required: true
  }
}, {
  timestamps: true
});
module.exports = mongoose.model("AdminUser", AdminUserSchema);