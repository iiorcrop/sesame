const mongoose = require("mongoose");

const flashNewsSchema = new mongoose.Schema(
  {
    news: {
      type: String,
      required: [true, "Flash news text is required"],
      trim: true,
      maxlength: [200, "Flash news must be at most 200 characters"],
    }
 
  },
  { timestamps: true }
);

module.exports = mongoose.model("FlashNews", flashNewsSchema);
