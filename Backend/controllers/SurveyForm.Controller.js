const SurveyInput = require('../models/SurveyInput.Modal');

exports.createSurveyInput = async (req, res) => {
  try {
    const inputs = req.body.data;
    const created = await SurveyInput.insertMany(inputs);
    return res.status(201).json({ message: "Survey inputs created", count: created.length, inputs: created });
  } catch (err) {
    console.error("[createSurveyInput] Error:", err);
    return res.status(500).json({ message: "Server error creating inputs" });
  }
};

exports.getSurveyInputs = async (req, res) => {
  try {
    const { surveyId } = req.query;
    const filter = {};
    if (surveyId) {
      if (!/^[a-fA-F0-9]{24}$/.test(surveyId)) {
        return res.status(400).json({ message: "Invalid surveyId format" });
      }
      filter.surveyId = surveyId;
    }
    const inputs = await SurveyInput.find(filter).sort({ createdAt: 1 });
    return res.status(200).json({ message: "Survey inputs fetched", count: inputs.length, inputs });
  } catch (err) {
    console.error("[getSurveyInputs] Error:", err);
    return res.status(500).json({ message: "Error fetching inputs" });
  }
};

exports.updateSurveyInput = async (req, res) => {
  const { _id, title, type } = req.body.data;
  try {
    const updated = await SurveyInput.findByIdAndUpdate(_id, { title, type }, { new: true });
    if (!updated) {
      return res.status(404).json({ message: "Input not found" });
    }
    return res.status(200).json({ message: "Survey input updated", input: updated });
  } catch (err) {
    console.error("[updateSurveyInput] Error:", err);
    return res.status(500).json({ message: "Error updating input" });
  }
};

exports.deleteSurveyInput = async (req, res) => {
  const { _id } = req.body;
  if (!_id || !/^[a-fA-F0-9]{24}$/.test(_id)) {
    return res.status(400).json({ message: "Invalid _id" });
  }
  try {
    const deleted = await SurveyInput.findByIdAndDelete(_id);
    if (!deleted) {
      return res.status(404).json({ message: "Survey input not found" });
    }
    return res.status(200).json({ message: "Survey input deleted" });
  } catch (err) {
    console.error("[deleteSurveyInput] Error:", err);
    return res.status(500).json({ message: "Error deleting input" });
  }
};