"use strict";

var StaffInput = require("../models/StaffInput"); // Create staff input


var createStaffInput = function createStaffInput(req, res) {
  var _req$body, title, type, position, options, required, allowedTypes, staffInputData, staffInput;

  return regeneratorRuntime.async(function createStaffInput$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _req$body = req.body, title = _req$body.title, type = _req$body.type, position = _req$body.position, options = _req$body.options, required = _req$body.required;

          if (!(!title || typeof title !== "string" || !title.trim())) {
            _context.next = 4;
            break;
          }

          return _context.abrupt("return", res.status(400).json({
            error: "Title is required."
          }));

        case 4:
          if (!(!type || typeof type !== "string" || !type.trim())) {
            _context.next = 6;
            break;
          }

          return _context.abrupt("return", res.status(400).json({
            error: "Type is required."
          }));

        case 6:
          if (!(title.length > 50)) {
            _context.next = 8;
            break;
          }

          return _context.abrupt("return", res.status(400).json({
            error: "Title must be at most 50 characters."
          }));

        case 8:
          if (!(type.length > 30)) {
            _context.next = 10;
            break;
          }

          return _context.abrupt("return", res.status(400).json({
            error: "Type must be at most 30 characters."
          }));

        case 10:
          allowedTypes = ["text", "textarea", "dropdown", "email", "number", "date", "password", "tel", "url"];

          if (allowedTypes.includes(type)) {
            _context.next = 13;
            break;
          }

          return _context.abrupt("return", res.status(400).json({
            error: "Invalid input type."
          }));

        case 13:
          staffInputData = {
            title: title.trim(),
            type: type.trim(),
            position: typeof position === "number" ? position : 0,
            required: !!required
          };

          if (!(type === "dropdown")) {
            _context.next = 18;
            break;
          }

          if (!(!Array.isArray(options) || options.length === 0)) {
            _context.next = 17;
            break;
          }

          return _context.abrupt("return", res.status(400).json({
            error: "Dropdown options are required."
          }));

        case 17:
          staffInputData.options = options;

        case 18:
          staffInput = new StaffInput(staffInputData);
          _context.next = 21;
          return regeneratorRuntime.awrap(staffInput.save());

        case 21:
          res.status(201).json(staffInput);
          _context.next = 27;
          break;

        case 24:
          _context.prev = 24;
          _context.t0 = _context["catch"](0);
          res.status(500).json({
            error: "Server error."
          });

        case 27:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 24]]);
}; // Get all staff inputs


var getAllStaffInputs = function getAllStaffInputs(req, res) {
  var inputs;
  return regeneratorRuntime.async(function getAllStaffInputs$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          _context2.next = 3;
          return regeneratorRuntime.awrap(StaffInput.find().sort({
            createdAt: -1
          }));

        case 3:
          inputs = _context2.sent;
          res.json(inputs);
          _context2.next = 10;
          break;

        case 7:
          _context2.prev = 7;
          _context2.t0 = _context2["catch"](0);
          res.status(500).json({
            error: "Server error."
          });

        case 10:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 7]]);
}; // Update staff input positions (bulk reorder)


var updateStaffPositions = function updateStaffPositions(req, res) {
  var positions, bulkOps;
  return regeneratorRuntime.async(function updateStaffPositions$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          positions = req.body.positions; // [{ _id, position }, ...]

          if (Array.isArray(positions)) {
            _context3.next = 4;
            break;
          }

          return _context3.abrupt("return", res.status(400).json({
            error: "Positions array required."
          }));

        case 4:
          // Bulk update positions
          bulkOps = positions.map(function (_ref) {
            var _id = _ref._id,
                position = _ref.position;
            return {
              updateOne: {
                filter: {
                  _id: _id
                },
                update: {
                  $set: {
                    position: position
                  }
                }
              }
            };
          });
          _context3.next = 7;
          return regeneratorRuntime.awrap(StaffInput.bulkWrite(bulkOps));

        case 7:
          res.json({
            success: true
          });
          _context3.next = 13;
          break;

        case 10:
          _context3.prev = 10;
          _context3.t0 = _context3["catch"](0);
          res.status(500).json({
            error: "Server error."
          });

        case 13:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[0, 10]]);
}; // Edit staff input by ID


var editStaffInput = function editStaffInput(req, res) {
  var id, _req$body2, title, type, options, required, allowedTypes, updateData, updated;

  return regeneratorRuntime.async(function editStaffInput$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.prev = 0;
          id = req.params.id;
          _req$body2 = req.body, title = _req$body2.title, type = _req$body2.type, options = _req$body2.options, required = _req$body2.required;

          if (!(!title || typeof title !== "string" || !title.trim())) {
            _context4.next = 5;
            break;
          }

          return _context4.abrupt("return", res.status(400).json({
            error: "Title is required."
          }));

        case 5:
          if (!(!type || typeof type !== "string" || !type.trim())) {
            _context4.next = 7;
            break;
          }

          return _context4.abrupt("return", res.status(400).json({
            error: "Type is required."
          }));

        case 7:
          if (!(title.length > 50)) {
            _context4.next = 9;
            break;
          }

          return _context4.abrupt("return", res.status(400).json({
            error: "Title must be at most 50 characters."
          }));

        case 9:
          if (!(type.length > 30)) {
            _context4.next = 11;
            break;
          }

          return _context4.abrupt("return", res.status(400).json({
            error: "Type must be at most 30 characters."
          }));

        case 11:
          allowedTypes = ["text", "textarea", "dropdown", "email", "number", "date", "password", "tel", "url"];

          if (allowedTypes.includes(type)) {
            _context4.next = 14;
            break;
          }

          return _context4.abrupt("return", res.status(400).json({
            error: "Invalid input type."
          }));

        case 14:
          updateData = {
            title: title.trim(),
            type: type.trim(),
            required: !!required
          };

          if (!(type === "dropdown")) {
            _context4.next = 19;
            break;
          }

          if (!(!Array.isArray(options) || options.length === 0)) {
            _context4.next = 18;
            break;
          }

          return _context4.abrupt("return", res.status(400).json({
            error: "Dropdown options are required."
          }));

        case 18:
          updateData.options = options;

        case 19:
          _context4.next = 21;
          return regeneratorRuntime.awrap(StaffInput.findByIdAndUpdate(id, updateData, {
            "new": true
          }));

        case 21:
          updated = _context4.sent;

          if (updated) {
            _context4.next = 24;
            break;
          }

          return _context4.abrupt("return", res.status(404).json({
            error: "Staff input not found."
          }));

        case 24:
          res.json(updated);
          _context4.next = 30;
          break;

        case 27:
          _context4.prev = 27;
          _context4.t0 = _context4["catch"](0);
          res.status(500).json({
            error: "Server error."
          });

        case 30:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[0, 27]]);
}; // Delete staff input by ID


var deleteStaffInput = function deleteStaffInput(req, res) {
  var id, deleted;
  return regeneratorRuntime.async(function deleteStaffInput$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _context5.prev = 0;
          id = req.params.id;
          _context5.next = 4;
          return regeneratorRuntime.awrap(StaffInput.findByIdAndDelete(id));

        case 4:
          deleted = _context5.sent;

          if (deleted) {
            _context5.next = 7;
            break;
          }

          return _context5.abrupt("return", res.status(404).json({
            error: "Staff input not found."
          }));

        case 7:
          res.json({
            success: true
          });
          _context5.next = 13;
          break;

        case 10:
          _context5.prev = 10;
          _context5.t0 = _context5["catch"](0);
          res.status(500).json({
            error: "Server error."
          });

        case 13:
        case "end":
          return _context5.stop();
      }
    }
  }, null, null, [[0, 10]]);
};

module.exports = {
  createStaffInput: createStaffInput,
  getAllStaffInputs: getAllStaffInputs,
  updateStaffPositions: updateStaffPositions,
  editStaffInput: editStaffInput,
  deleteStaffInput: deleteStaffInput
};