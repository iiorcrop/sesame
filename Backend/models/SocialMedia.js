const mongoose = require('mongoose');

const SocialMediaSchema = new mongoose.Schema(
  {
    platform: {
      type: String,
      required: true,
      trim: true
    },
    icon: {
      type: String,
      required: true
    },
    value: {
      type: String,
      required: true // This could be a URL or phone number
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('SocialMedia', SocialMediaSchema);
