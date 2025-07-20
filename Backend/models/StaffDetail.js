const mongoose = require("mongoose");
const staffConnection = require("../config/staffDb");


const StaffDetailSchema = new mongoose.Schema({
  userID: { type: String, required: true, index: true }, // Identify staff user
  data: { type: Object, required: true }, // Flexible: stores all submitted fields
  submittedAt: { type: Date, default: Date.now },
  position: { type: Number, default: 0 }, // For ordering within department
  subposition: { type: Number, default: 0 }, // For ordering within division
}, { timestamps: true });

module.exports = staffConnection.model("StaffDetail", StaffDetailSchema);
