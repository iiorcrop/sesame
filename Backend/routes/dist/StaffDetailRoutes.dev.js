"use strict";

var express = require("express");

var router = express.Router();

var _require = require("../controllers/StaffDetailController"),
    createStaffDetail = _require.createStaffDetail,
    getAllStaffDetails = _require.getAllStaffDetails,
    reorderStaffDetails = _require.reorderStaffDetails,
    updateStaffDetail = _require.updateStaffDetail,
    deleteStaffDetail = _require.deleteStaffDetail,
    getStaffDetailByUserID = _require.getStaffDetailByUserID; // GET /api/staff-details/user/:userID


router.get("/user/:userID", getStaffDetailByUserID); // POST /api/staff-details

router.post("/", createStaffDetail); // GET /api/staff-details

router.get("/", getAllStaffDetails); // PUT /api/staff-details/reorder

router.put("/reorder", reorderStaffDetails); // PUT /api/staff-details/:id

router.put("/:id", updateStaffDetail); // DELETE /api/staff-details/:id

router["delete"]("/:id", deleteStaffDetail);
module.exports = router;