const express = require("express");
const router = express.Router();
const { createStaffDetail, getAllStaffDetails, reorderStaffDetails, updateStaffDetail, deleteStaffDetail, getStaffDetailByUserID } = require("../controllers/StaffDetailController");

// GET /api/staff-details/user/:userID
router.get("/user/:userID", getStaffDetailByUserID);
// POST /api/staff-details
router.post("/", createStaffDetail);
// GET /api/staff-details
router.get("/", getAllStaffDetails);
// PUT /api/staff-details/reorder
router.put("/reorder", reorderStaffDetails);
// PUT /api/staff-details/:id
router.put("/:id", updateStaffDetail);
// DELETE /api/staff-details/:id
router.delete("/:id", deleteStaffDetail);

module.exports = router;
