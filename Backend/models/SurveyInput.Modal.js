const mongoose = require('mongoose');

const SurveyInputSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ['Text', 'Number', 'Checkbox', 'Date'],
    required: true,
  },
  surveyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Survey',
    required: false,
    default: undefined,
  },
}, { timestamps: true });

module.exports = mongoose.model('SurveyInput', SurveyInputSchema);