const mongoose = require("mongoose");

const NewsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    expiresOn: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("News", NewsSchema);
