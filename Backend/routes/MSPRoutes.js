const express = require("express");
const {
  createMSP,
  getAllMSP,
  getMSPByYear,
  updateMSP,
  deleteMSP,
  getMSPChartData,
} = require("../controllers/MSPController");

const router = express.Router();

// Public routes
router.get("/msp", getAllMSP);
router.get("/msp/chart", getMSPChartData);
router.get("/msp/:year", getMSPByYear);

// Protected routes (require admin authentication)
router.post("/msp", createMSP);
router.put("/msp/:id", updateMSP);
router.delete("/msp/:id", deleteMSP);

module.exports = router;

// year wise APY data graph filter
