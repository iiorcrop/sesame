const mongoose = require("mongoose");

// Define the MSP (Minimum Support Price) schema
const ResourceSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: [
        "pops",
        "news-letter",
        "research-paper",
        "book",
        "book-chapter",
        "article",
        "technical-bulletins",
        "training-manual",
        "e-publications",
        "policy-paper",
        "extension-folder",
      ],
    },
    content: {
      type: String,
      required: true,
    },
    year: {
      type: Number,
      required: true,
      validate: {
        validator: function (v) {
          return v >= 1900 && v <= new Date().getFullYear();
        },
        message: (props) => `${props.value} is not a valid year!`,
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Resource", ResourceSchema);
