const mongoose = require("mongoose");

const WhatsappNumberSchema = new mongoose.Schema(
  {
    number: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
  },
  {
    timeseries: true,
  }
);

module.exports = mongoose.model("WhatsappNumber", WhatsappNumberSchema);
