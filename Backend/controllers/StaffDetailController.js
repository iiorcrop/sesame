const StaffDetail = require("../models/StaffDetail");

// Store staff details
const createStaffDetail = async (req, res) => {
  try {
    const { data, userID } = req.body;
    if (!data || typeof data !== "object" || !userID) {
      return res.status(400).json({ error: "Staff details data and userID are required." });
    }
    const staffDetail = new StaffDetail({ userID, data });
    await staffDetail.save();
    res.status(201).json(staffDetail);
  } catch (err) {
    res.status(500).json({ error: "Server error." });
  }
};

// Get staff details by userID
const getStaffDetailByUserID = async (req, res) => {
  try {
    const { userID } = req.params;
    if (!userID) return res.status(400).json({ error: "userID is required." });
    const staffDetail = await StaffDetail.findOne({ userID });
    if (!staffDetail) return res.status(404).json({ error: "Staff detail not found." });
    res.status(200).json(staffDetail);
  } catch (err) {
    res.status(500).json({ error: "Server error." });
  }
};

// Get all staff details
const getAllStaffDetails = async (req, res) => {
    try {
        const staffDetails = await StaffDetail.find();
        res.status(200).json(staffDetails);
    } catch (err) {
        res.status(500).json({ error: "Server error." });
    }
};
// Reorder staff details within a department and division
const reorderStaffDetails = async (req, res) => {
  try {
    const { department, division, ids } = req.body;
    if (!department || !Array.isArray(ids)) {
      return res.status(400).json({ error: "Department and ordered staff IDs are required." });
    }
    // Find all staff in the department and division (if provided)
    let query = { "data.Department": department };
    if (division) {
      query["data.division_hardcoded"] = division;
    }
    const staffInGroup = await StaffDetail.find(query);
    // Update position and subposition for each staff in the new order
    for (let i = 0; i < ids.length; i++) {
      await StaffDetail.findByIdAndUpdate(ids[i], { $set: { position: i, subposition: division ? i : 0 } });
    }
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Server error." });
  }
};

// Update staff detail
const updateStaffDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const { data } = req.body;
    if (!data || typeof data !== "object") {
      return res.status(400).json({ error: "Staff details data is required." });
    }
    const updated = await StaffDetail.findByIdAndUpdate(id, { data }, { new: true });
    if (!updated) return res.status(404).json({ error: "Staff detail not found." });
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: "Server error." });
  }
};

// Delete staff detail
const deleteStaffDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await StaffDetail.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: "Staff detail not found." });
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Server error." });
  }
};

module.exports = {
  createStaffDetail,
  getAllStaffDetails,
  reorderStaffDetails,
  updateStaffDetail,
  deleteStaffDetail,
  getStaffDetailByUserID
};
