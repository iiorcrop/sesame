// routes/HybridRoutes.js
const express = require("express");
const {
  createHybrid,
  getAllHybrids,
  getHybridById,
  updateHybrid,
  deleteHybrid,
  createProperty,
  getPropertiesByHybrid,
  updateProperty,
  deleteProperty,
  getHybridsImages,
} = require("../controllers/HybridController");
const { normalizeParams } = require("../middleware/normalizeParams");

const router = express.Router();

// Routes for hybrids
router.get("/hybrids/images", getHybridsImages);

// Public routes
router.get("/hybrids", getAllHybrids);
router.get("/hybrids/:id", normalizeParams, getHybridById);

// Admin-only routes (protected)
router.post("/hybrids", createHybrid);
router.put("/hybrids/:id", normalizeParams, updateHybrid);
router.delete("/hybrids/:id", normalizeParams, deleteHybrid);

// Routes for properties
// Admin-only routes (protected)
router.post("/hybrid-properties", createProperty);
router.put(
  "/hybrid-properties/:id",

  normalizeParams,
  updateProperty
);
router.delete(
  "/hybrid-properties/:id",

  normalizeParams,
  deleteProperty
);

// Public routes
router.get(
  "/hybrids/:hybridId/properties",
  normalizeParams,
  getPropertiesByHybrid
);

module.exports = router;
