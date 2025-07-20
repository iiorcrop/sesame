// models/MainItem.js
const mongoose = require("mongoose");

const MainItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  position: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("MainItem", MainItemSchema);
