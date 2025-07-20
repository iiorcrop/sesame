const mongoose = require("mongoose");

// Define the Market Year schema
const MarketYearSchema = new mongoose.Schema({
  year: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    validate: {
      validator: function (v) {
        return /^\d{4}$/.test(v); // Validates that the year is a 4-digit number
      },
      message: (props) =>
        `${props.value} is not a valid year format! Year should be a 4-digit number.`,
    },
  },
  description: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Export the model
module.exports = mongoose.model("MarketYear", MarketYearSchema);
