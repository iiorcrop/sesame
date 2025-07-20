const express = require("express");
const router = express.Router();
const { submitFormResponse } = require("../controllers/SurveyResponse.controller");

router.post("/submit", submitFormResponse);

module.exports = router;
