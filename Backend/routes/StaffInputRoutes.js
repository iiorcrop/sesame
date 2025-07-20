const express = require("express");
const router = express.Router();
const {
  createStaffInput,
  getAllStaffInputs,
  updateStaffPositions,
  editStaffInput,
  deleteStaffInput,
} = require("../controllers/StaffInputController");

// POST /api/staff-inputs
router.post("/", createStaffInput);

// GET /api/staff-inputs
router.get("/", getAllStaffInputs);

// PATCH /api/staff-inputs/positions
router.patch("/positions", updateStaffPositions);

// PUT /api/staff-inputs/:id
router.put("/:id", editStaffInput);

// DELETE /api/staff-inputs/:id
router.delete("/:id", deleteStaffInput);

module.exports = router;
