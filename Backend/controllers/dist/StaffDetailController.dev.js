"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var StaffDetail = require("../models/StaffDetail"); // Store staff details


var createStaffDetail = function createStaffDetail(req, res) {
  var _req$body, data, userID, staffDetail;

  return regeneratorRuntime.async(function createStaffDetail$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _req$body = req.body, data = _req$body.data, userID = _req$body.userID;

          if (!(!data || _typeof(data) !== "object" || !userID)) {
            _context.next = 4;
            break;
          }

          return _context.abrupt("return", res.status(400).json({
            error: "Staff details data and userID are required."
          }));

        case 4:
          staffDetail = new StaffDetail({
            userID: userID,
            data: data
          });
          _context.next = 7;
          return regeneratorRuntime.awrap(staffDetail.save());

        case 7:
          res.status(201).json(staffDetail);
          _context.next = 13;
          break;

        case 10:
          _context.prev = 10;
          _context.t0 = _context["catch"](0);
          res.status(500).json({
            error: "Server error."
          });

        case 13:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 10]]);
}; // Get staff details by userID


var getStaffDetailByUserID = function getStaffDetailByUserID(req, res) {
  var userID, staffDetail;
  return regeneratorRuntime.async(function getStaffDetailByUserID$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          userID = req.params.userID;

          if (userID) {
            _context2.next = 4;
            break;
          }

          return _context2.abrupt("return", res.status(400).json({
            error: "userID is required."
          }));

        case 4:
          _context2.next = 6;
          return regeneratorRuntime.awrap(StaffDetail.findOne({
            userID: userID
          }));

        case 6:
          staffDetail = _context2.sent;

          if (staffDetail) {
            _context2.next = 9;
            break;
          }

          return _context2.abrupt("return", res.status(404).json({
            error: "Staff detail not found."
          }));

        case 9:
          res.status(200).json(staffDetail);
          _context2.next = 15;
          break;

        case 12:
          _context2.prev = 12;
          _context2.t0 = _context2["catch"](0);
          res.status(500).json({
            error: "Server error."
          });

        case 15:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 12]]);
}; // Get all staff details


var getAllStaffDetails = function getAllStaffDetails(req, res) {
  var staffDetails;
  return regeneratorRuntime.async(function getAllStaffDetails$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          _context3.next = 3;
          return regeneratorRuntime.awrap(StaffDetail.find());

        case 3:
          staffDetails = _context3.sent;
          res.status(200).json(staffDetails);
          _context3.next = 10;
          break;

        case 7:
          _context3.prev = 7;
          _context3.t0 = _context3["catch"](0);
          res.status(500).json({
            error: "Server error."
          });

        case 10:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[0, 7]]);
}; // Reorder staff details within a department and division


var reorderStaffDetails = function reorderStaffDetails(req, res) {
  var _req$body2, department, division, ids, query, staffInGroup, i;

  return regeneratorRuntime.async(function reorderStaffDetails$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.prev = 0;
          _req$body2 = req.body, department = _req$body2.department, division = _req$body2.division, ids = _req$body2.ids;

          if (!(!department || !Array.isArray(ids))) {
            _context4.next = 4;
            break;
          }

          return _context4.abrupt("return", res.status(400).json({
            error: "Department and ordered staff IDs are required."
          }));

        case 4:
          // Find all staff in the department and division (if provided)
          query = {
            "data.Department": department
          };

          if (division) {
            query["data.division_hardcoded"] = division;
          }

          _context4.next = 8;
          return regeneratorRuntime.awrap(StaffDetail.find(query));

        case 8:
          staffInGroup = _context4.sent;
          i = 0;

        case 10:
          if (!(i < ids.length)) {
            _context4.next = 16;
            break;
          }

          _context4.next = 13;
          return regeneratorRuntime.awrap(StaffDetail.findByIdAndUpdate(ids[i], {
            $set: {
              position: i,
              subposition: division ? i : 0
            }
          }));

        case 13:
          i++;
          _context4.next = 10;
          break;

        case 16:
          res.status(200).json({
            success: true
          });
          _context4.next = 22;
          break;

        case 19:
          _context4.prev = 19;
          _context4.t0 = _context4["catch"](0);
          res.status(500).json({
            error: "Server error."
          });

        case 22:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[0, 19]]);
}; // Update staff detail


var updateStaffDetail = function updateStaffDetail(req, res) {
  var id, data, updated;
  return regeneratorRuntime.async(function updateStaffDetail$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _context5.prev = 0;
          id = req.params.id;
          data = req.body.data;

          if (!(!data || _typeof(data) !== "object")) {
            _context5.next = 5;
            break;
          }

          return _context5.abrupt("return", res.status(400).json({
            error: "Staff details data is required."
          }));

        case 5:
          _context5.next = 7;
          return regeneratorRuntime.awrap(StaffDetail.findByIdAndUpdate(id, {
            data: data
          }, {
            "new": true
          }));

        case 7:
          updated = _context5.sent;

          if (updated) {
            _context5.next = 10;
            break;
          }

          return _context5.abrupt("return", res.status(404).json({
            error: "Staff detail not found."
          }));

        case 10:
          res.status(200).json(updated);
          _context5.next = 16;
          break;

        case 13:
          _context5.prev = 13;
          _context5.t0 = _context5["catch"](0);
          res.status(500).json({
            error: "Server error."
          });

        case 16:
        case "end":
          return _context5.stop();
      }
    }
  }, null, null, [[0, 13]]);
}; // Delete staff detail


var deleteStaffDetail = function deleteStaffDetail(req, res) {
  var id, deleted;
  return regeneratorRuntime.async(function deleteStaffDetail$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          _context6.prev = 0;
          id = req.params.id;
          _context6.next = 4;
          return regeneratorRuntime.awrap(StaffDetail.findByIdAndDelete(id));

        case 4:
          deleted = _context6.sent;

          if (deleted) {
            _context6.next = 7;
            break;
          }

          return _context6.abrupt("return", res.status(404).json({
            error: "Staff detail not found."
          }));

        case 7:
          res.status(200).json({
            success: true
          });
          _context6.next = 13;
          break;

        case 10:
          _context6.prev = 10;
          _context6.t0 = _context6["catch"](0);
          res.status(500).json({
            error: "Server error."
          });

        case 13:
        case "end":
          return _context6.stop();
      }
    }
  }, null, null, [[0, 10]]);
};

module.exports = {
  createStaffDetail: createStaffDetail,
  getAllStaffDetails: getAllStaffDetails,
  reorderStaffDetails: reorderStaffDetails,
  updateStaffDetail: updateStaffDetail,
  deleteStaffDetail: deleteStaffDetail,
  getStaffDetailByUserID: getStaffDetailByUserID
};