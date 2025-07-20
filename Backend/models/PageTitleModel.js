const mongoose = require("mongoose");

const TitleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subtitle: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Title", TitleSchema);
