const mongoose = require("mongoose");

const OfferingsSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["patent", "awards"],
    },
    content: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: false, // Image is optional
    },
    date: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Offering", OfferingsSchema);
