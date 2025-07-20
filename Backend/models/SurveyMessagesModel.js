const mongoose = require("mongoose");

const SurveyResponseSchema = new mongoose.Schema({
  responses: {
    type: Map,
    of: String,
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model("SurveyResponse", SurveyResponseSchema);
