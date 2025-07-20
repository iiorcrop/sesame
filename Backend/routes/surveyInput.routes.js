const express = require('express');
const router = express.Router();
const {
  createSurveyInput,
  getSurveyInputs,
  updateSurveyInput,
  deleteSurveyInput
} = require('../controllers/SurveyForm.Controller');

const validateSurveyInput = require('../middleware/surveyInput.middleware');

router.post('/create', validateSurveyInput, createSurveyInput);
router.get('/list', getSurveyInputs);
router.post('/update', validateSurveyInput, updateSurveyInput);
router.post('/delete', deleteSurveyInput);

module.exports = router;