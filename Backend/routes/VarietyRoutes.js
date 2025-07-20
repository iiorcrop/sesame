// routes/VarietyRoutes.js
const express = require("express");
const {
  createVariety,
  getAllVarieties,
  getVarietyById,
  updateVariety,
  deleteVariety,
  createProperty,
  getPropertiesByVariety,
  updateProperty,
  deleteProperty,
  getVarietiesImages,
} = require("../controllers/VarietyController");
const { authMiddleware } = require("../middleware/authMiddleware");
const { normalizeParams } = require("../middleware/normalizeParams");

const router = express.Router();

router.get("/varieties/images", getVarietiesImages);
// Routes for varieties
router.post("/varieties", createVariety);
router.get("/varieties", getAllVarieties);
router.get("/varieties/:id", normalizeParams, getVarietyById);
router.put("/varieties/:id", normalizeParams, updateVariety);
router.delete("/varieties/:id", normalizeParams, deleteVariety);

// Routes for properties
router.post("/properties", createProperty);
router.get(
  "/varieties/:varietyId/properties",
  normalizeParams,
  getPropertiesByVariety
);
router.put("/properties/:id", normalizeParams, updateProperty);
router.delete("/properties/:id", normalizeParams, deleteProperty);

module.exports = router;
