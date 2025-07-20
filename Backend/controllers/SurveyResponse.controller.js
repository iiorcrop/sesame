const FormResponse = require("../models/SurveyResponse");

exports.submitFormResponse = async (req, res) => {
  try {
    const { responses, submittedBy } = req.body;

    if (!Array.isArray(responses) || responses.length === 0) {
      return res.status(400).json({ message: "No responses provided" });
    }

    const newResponse = new FormResponse({
      responses,
      submittedBy: submittedBy || "anonymous"
    });

    await newResponse.save();

    return res.status(201).json({ message: "Form response submitted", id: newResponse._id });
  } catch (error) {
    console.error("Error submitting form response:", error);
    res.status(500).json({ message: "Failed to save response", error });
  }
};
