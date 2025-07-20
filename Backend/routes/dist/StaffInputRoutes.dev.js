"use strict";

var express = require("express");

var router = express.Router();

var _require = require("../controllers/StaffInputController"),
    createStaffInput = _require.createStaffInput,
    getAllStaffInputs = _require.getAllStaffInputs,
    updateStaffPositions = _require.updateStaffPositions,
    editStaffInput = _require.editStaffInput,
    deleteStaffInput = _require.deleteStaffInput; // POST /api/staff-inputs


router.post("/", createStaffInput); // GET /api/staff-inputs

router.get("/", getAllStaffInputs); // PATCH /api/staff-inputs/positions

router.patch("/positions", updateStaffPositions); // PUT /api/staff-inputs/:id

router.put("/:id", editStaffInput); // DELETE /api/staff-inputs/:id

router["delete"]("/:id", deleteStaffInput);
module.exports = router;