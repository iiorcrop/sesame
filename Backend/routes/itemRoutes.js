// routes/itemRoutes.js
const express = require("express");
const {
  createMainItem,
  createSubItem,
  createSubSubItem,
  updateMainItem,
  updateSubItem,
  updateSubSubItem,
  updatemainItemOrder,
  deleteMainItem,
  deleteSubItem,
  deleteSubSubItem,
  getAllMainItems,
  getAllSubItems,
  getAllSubSubItems,
} = require("../controllers/ItemController");

const router = express.Router();

// Routes for main items
router.post("/main-item", createMainItem);
router.put("/main-item/:id", updateMainItem);
router.post("/main-item/order", updatemainItemOrder);
router.delete("/main-item/:id", deleteMainItem);

// Routes for sub items
router.post("/sub-item", createSubItem);
router.put("/sub-item/:id", updateSubItem);
router.delete("/sub-item/:id", deleteSubItem);

// Routes for sub-sub items
router.post("/sub-sub-item", createSubSubItem);
router.put("/sub-sub-item/:id", updateSubSubItem);
router.delete("/sub-sub-item/:id", deleteSubSubItem);

// Fetch all main items
router.get("/main-item", getAllMainItems);

// Fetch all sub items
router.get("/sub-item", getAllSubItems);

// Fetch all sub-sub items
router.get("/sub-sub-item", getAllSubSubItems);

module.exports = router;
