const mongoose = require("mongoose");

const MediaSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["press", "video"],
      required: true,
    },
    content: {
      type: String,
      required: true, // For press: image URL OR YouTube URL, For video: YouTube URL
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Media", MediaSchema);
