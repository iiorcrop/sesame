const express = require("express");
const router = express.Router();
const apyController = require("../controllers/APYController");

// APY Year management routes
router.post("/apy-years", apyController.createYear);
router.get("/apy-years", apyController.getAllYears);
router.get("/apy-years/:year", apyController.getYear);
router.delete("/apy-years/:year", apyController.deleteYear);

// APY data routes for specific year
router.post(
  "/apy-years/:year/upload-data",
  apyController.uploadMiddleware,
  apyController.uploadAPYData
);

router.get("/apy-years/:year/apy-data", apyController.getAPYDataForYear);

// Get a single APY data entry by ID
router.get(
  "/apy-years/:year/apy-data/:dataId",
  apyController.getAPYDataEntryById
);

// Update APY data entry
router.put(
  "/apy-years/:year/apy-data/:dataId",
  apyController.updateAPYDataForYear
);

module.exports = router;
