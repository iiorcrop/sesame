const mongoose = require("mongoose");

const StaffUserSchema = new mongoose.Schema({
  userID: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ["staff"],
    default: "staff",
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("StaffUser", StaffUserSchema);
