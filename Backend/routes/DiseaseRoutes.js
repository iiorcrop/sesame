// routes/DiseaseRoutes.js
const express = require("express");
const {
  createDisease,
  getAllDiseases,
  getDiseaseById,
  updateDisease,
  deleteDisease,
  createProperty,
  getPropertiesByDisease,
  updateProperty,
  deleteProperty,
  getDiseasesImages,
} = require("../controllers/DiseaseController");
const { normalizeParams } = require("../middleware/normalizeParams");

const router = express.Router();

// Routes for diseases
router.get("/diseases/images", getDiseasesImages);

router.post("/diseases", createDisease);
router.get("/diseases", getAllDiseases);
router.get("/diseases/:id", normalizeParams, getDiseaseById);
router.put("/diseases/:id", normalizeParams, updateDisease);
router.delete("/diseases/:id", normalizeParams, deleteDisease);

// Routes for properties
router.post("/disease-properties", createProperty);
router.get(
  "/diseases/:diseaseId/properties",
  normalizeParams,
  getPropertiesByDisease
);
router.put(
  "/disease-properties/:id",

  normalizeParams,
  updateProperty
);
router.delete(
  "/disease-properties/:id",

  normalizeParams,
  deleteProperty
);

module.exports = router;
