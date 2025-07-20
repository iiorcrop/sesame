const mongoose = require("mongoose");

// Define the MSP (Minimum Support Price) schema
const MSPSchema = new mongoose.Schema({
  year: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    validate: {
      validator: function (v) {
        return /^\d{4}-\d{4}$/.test(v); // Validates that the year is in format "YYYY-YYYY"
      },
      message: (props) =>
        `${props.value} is not a valid year format! Year should be in format "YYYY-YYYY".`,
    },
  },
  mspValue: {
    type: Number,
    required: true,
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

// Year is already unique so no need for additional indexes

// Pre-save middleware to update the updatedAt field
MSPSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Export the model
module.exports = mongoose.model("MSP", MSPSchema);
