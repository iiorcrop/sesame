const mongoose = require("mongoose");

const FormResponseSchema = new mongoose.Schema({
  responses: [
    {
      fieldId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SurveyInput',
        required: true
      },
      value: mongoose.Schema.Types.Mixed // String, Boolean, Number, Date
    }
  ],
  submittedAt: {
    type: Date,
    default: Date.now
  },
  submittedBy: {
    type: String, // e.g., IP, userId, etc (optional)
    default: "anonymous"
  }
});

module.exports = mongoose.model("FormResponse", FormResponseSchema);
