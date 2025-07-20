// models/SubItem.js
const mongoose = require("mongoose");

const SubItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  to: {
    type: String,
    default: null, // Optional field for URL
  },
  parent_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MainItem",
    required: true,
  },
  isVisible: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model("SubItem", SubItemSchema);
