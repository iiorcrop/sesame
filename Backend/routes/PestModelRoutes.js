// routes/pestRoutes.js
const express = require("express");
const {
  createpest,
  getAllpests,
  getpestById,
  updatepest,
  deletepest,
  createProperty,
  getPropertiesBypest,
  updateProperty,
  deleteProperty,
  getPestsImages,
} = require("../controllers/PestModelController");
const { normalizeParams } = require("../middleware/normalizeParams");

const router = express.Router();

router.get("/pests/images", getPestsImages);
// Routes for pests
router.post("/pests", createpest);
router.get("/pests", getAllpests);
router.get("/pests/:id", normalizeParams, getpestById);
router.put("/pests/:id", normalizeParams, updatepest);
router.delete("/pests/:id", normalizeParams, deletepest);

// Routes for properties
router.post("/pest-properties", createProperty);
router.get("/pests/:pestId/properties", normalizeParams, getPropertiesBypest);
router.put(
  "/pest-properties/:id",

  normalizeParams,
  updateProperty
);
router.delete(
  "/pest-properties/:id",

  normalizeParams,
  deleteProperty
);

module.exports = router;
