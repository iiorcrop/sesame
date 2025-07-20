const {
  sanitizeInput,
  stripInvisibleChars,
} = require("../utils/sanitizeInput");

module.exports = (req, res, next) => {
  try {
    const { action, data } = req.body;
    if (!action || typeof action !== "string") {
      return res.status(400).json({ message: "Invalid action" });
    }

    const allowedTypes = ["Text", "Number", "Checkbox", "Date"];

    if (action === "create") {
      if (!Array.isArray(data) || data.length === 0) {
        return res.status(400).json({ message: "Data must be a non-empty array" });
      }

      const cleanedInputs = [];
      for (let item of data) {
        let { title, type, surveyId } = item;
        title = stripInvisibleChars(sanitizeInput(title));
        type = stripInvisibleChars(type?.trim() || "");
        surveyId = typeof surveyId === "string" ? stripInvisibleChars(surveyId.trim()) : "";
        if (!title || !type || !allowedTypes.includes(type)) {
          return res.status(400).json({ message: "Invalid title or type in input list" });
        }
        if (surveyId === "") surveyId = undefined;
        if (surveyId && !/^[a-fA-F0-9]{24}$/.test(surveyId)) {
          return res.status(400).json({ message: "Invalid surveyId format" });
        }
        const cleanItem = { title, type };
        if (surveyId) cleanItem.surveyId = surveyId;
        cleanedInputs.push(cleanItem);
      }
      req.body.data = cleanedInputs;
    }

    if (action === "update") {
      let { _id, title, type } = data;
      if (!_id || !/^[a-fA-F0-9]{24}$/.test(_id)) {
        return res.status(400).json({ message: "Invalid _id" });
      }
      title = stripInvisibleChars(sanitizeInput(title));
      type = stripInvisibleChars(type?.trim() || "");
      if (!title || !type || !allowedTypes.includes(type)) {
        return res.status(400).json({ message: "Invalid title or type" });
      }
      req.body.data = { _id, title, type };
    }

    next();
  } catch (err) {
    console.error("[validateSurveyInput] Error:", err);
    return res.status(500).json({ message: "Validation failed" });
  }
};
