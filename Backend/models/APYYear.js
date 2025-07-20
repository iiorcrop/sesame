const mongoose = require("mongoose");

// Define the APY Year schema
const APYYearSchema = new mongoose.Schema({
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
module.exports = mongoose.model("APYYear", APYYearSchema);
