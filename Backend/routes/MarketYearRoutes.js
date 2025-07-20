const express = require("express");
const router = express.Router();
const marketYearController = require("../controllers/MarketYearController");

// Year management routes
router.post("/market-years", marketYearController.createYear);
router.get("/market-years", marketYearController.getAllYears);
router.get("/market-years/:year", marketYearController.getYear);
router.delete("/market-years/:year", marketYearController.deleteYear);

// Market data routes for specific year
router.post(
  "/market-years/:year/upload-data",
  marketYearController.uploadMiddleware,
  marketYearController.uploadMarketData
);

router.get(
  "/market-years/:year/market-data",
  marketYearController.getMarketDataForYear
);

// Get a single market data entry by ID
router.get(
  "/market-years/:year/market-data/:dataId",
  marketYearController.getMarketDataEntryById
);

// Add route for updating market data
router.put(
  "/market-years/:year/market-data/:dataId",
  marketYearController.updateMarketDataForYear
);

router.get(
  "/market-years/:year/get-filters",
  marketYearController.getMarketDataFilters
);
module.exports = router;
