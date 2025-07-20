const StaffInput = require("../models/StaffInput");

// Create staff input
const createStaffInput = async (req, res) => {
  try {
    const { title, type, position, options, required } = req.body;
    if (!title || typeof title !== "string" || !title.trim()) {
      return res.status(400).json({ error: "Title is required." });
    }
    if (!type || typeof type !== "string" || !type.trim()) {
      return res.status(400).json({ error: "Type is required." });
    }
    if (title.length > 50) {
      return res.status(400).json({ error: "Title must be at most 50 characters." });
    }
    if (type.length > 30) {
      return res.status(400).json({ error: "Type must be at most 30 characters." });
    }
    const allowedTypes = ["text", "textarea", "dropdown", "email", "number", "date", "password", "tel", "url"];
    if (!allowedTypes.includes(type)) {
      return res.status(400).json({ error: "Invalid input type." });
    }
    let staffInputData = {
      title: title.trim(),
      type: type.trim(),
      position: typeof position === "number" ? position : 0,
      required: !!required,
    };
    if (type === "dropdown") {
      if (!Array.isArray(options) || options.length === 0) {
        return res.status(400).json({ error: "Dropdown options are required." });
      }
      staffInputData.options = options;
    }
    const staffInput = new StaffInput(staffInputData);
    await staffInput.save();
    res.status(201).json(staffInput);
  } catch (err) {
    res.status(500).json({ error: "Server error." });
  }
};

// Get all staff inputs
const getAllStaffInputs = async (req, res) => {
  try {
    const inputs = await StaffInput.find().sort({ createdAt: -1 });
    res.json(inputs);
  } catch (err) {
    res.status(500).json({ error: "Server error." });
  }
};

// Update staff input positions (bulk reorder)
const updateStaffPositions = async (req, res) => {
  try {
    const { positions } = req.body; // [{ _id, position }, ...]
    if (!Array.isArray(positions)) {
      return res.status(400).json({ error: "Positions array required." });
    }
    // Bulk update positions
    const bulkOps = positions.map(({ _id, position }) => ({
      updateOne: {
        filter: { _id },
        update: { $set: { position } },
      },
    }));
    await StaffInput.bulkWrite(bulkOps);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Server error." });
  }
};

// Edit staff input by ID
const editStaffInput = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, type, options, required } = req.body;
    if (!title || typeof title !== "string" || !title.trim()) {
      return res.status(400).json({ error: "Title is required." });
    }
    if (!type || typeof type !== "string" || !type.trim()) {
      return res.status(400).json({ error: "Type is required." });
    }
    if (title.length > 50) {
      return res.status(400).json({ error: "Title must be at most 50 characters." });
    }
    if (type.length > 30) {
      return res.status(400).json({ error: "Type must be at most 30 characters." });
    }
    const allowedTypes = ["text", "textarea", "dropdown", "email", "number", "date", "password", "tel", "url"];
    if (!allowedTypes.includes(type)) {
      return res.status(400).json({ error: "Invalid input type." });
    }
    let updateData = {
      title: title.trim(),
      type: type.trim(),
      required: !!required,
    };
    if (type === "dropdown") {
      if (!Array.isArray(options) || options.length === 0) {
        return res.status(400).json({ error: "Dropdown options are required." });
      }
      updateData.options = options;
    }
    const updated = await StaffInput.findByIdAndUpdate(id, updateData, { new: true });
    if (!updated) return res.status(404).json({ error: "Staff input not found." });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Server error." });
  }
};

// Delete staff input by ID
const deleteStaffInput = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await StaffInput.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: "Staff input not found." });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Server error." });
  }
};

module.exports = {
  createStaffInput,
  getAllStaffInputs,
  updateStaffPositions,
  editStaffInput,
  deleteStaffInput,
};
