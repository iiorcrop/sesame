const MSP = require("../models/MSP");
const mongoose = require("mongoose");

// Create a new MSP entry
exports.createMSP = async (req, res) => {
  try {
    const { year, mspValue } = req.body;

    // Validate input
    if (!year || !mspValue) {
      return res.status(400).json({
        success: false,
        message: "Year and MSP value are required",
      });
    }

    // Validate year format (YYYY-YYYY)
    if (!/^\d{4}-\d{4}$/.test(year)) {
      return res.status(400).json({
        success: false,
        message: "Year should be in format YYYY-YYYY (e.g., 2020-2021)",
      });
    }

    // Check if an MSP for this year already exists
    const existingMSP = await MSP.findOne({ year });
    if (existingMSP) {
      return res.status(400).json({
        success: false,
        message: `MSP for the year ${year} already exists`,
      });
    }

    // Create new MSP entry
    const newMSP = new MSP({
      year,
      mspValue,
    });

    await newMSP.save();

    res.status(201).json({
      success: true,
      data: newMSP,
    });
  } catch (error) {
    console.error("Error creating MSP:", error);
    res.status(500).json({
      success: false,
      message: "Error creating MSP entry",
      error: error.message,
    });
  }
};

// Get all MSP entries
exports.getAllMSP = async (req, res) => {
  try {
    // Find MSPs and sort by year in ascending order
    const msps = await MSP.find().sort({ year: 1 });

    res.status(200).json({
      success: true,
      count: msps.length,
      data: msps,
    });
  } catch (error) {
    console.error("Error fetching MSP data:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving MSP data",
      error: error.message,
    });
  }
};

// Get MSP data by year
exports.getMSPByYear = async (req, res) => {
  try {
    const { year } = req.params;

    // Find MSP for the specified year
    const msp = await MSP.findOne({ year });

    if (!msp) {
      return res.status(404).json({
        success: false,
        message: `No MSP data found for the year ${year}`,
      });
    }

    res.status(200).json({
      success: true,
      data: msp,
    });
  } catch (error) {
    console.error("Error fetching MSP data:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving MSP data",
      error: error.message,
    });
  }
};

// Update an MSP entry
exports.updateMSP = async (req, res) => {
  try {
    const { id } = req.params;
    const { mspValue } = req.body;

    // Check if ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid MSP ID format",
      });
    }

    // Check if mspValue is provided
    if (!mspValue) {
      return res.status(400).json({
        success: false,
        message: "MSP value is required for update",
      });
    }

    // Update the MSP
    const updatedMSP = await MSP.findByIdAndUpdate(
      id,
      {
        mspValue,
        updatedAt: Date.now(),
      },
      { new: true, runValidators: true }
    );

    if (!updatedMSP) {
      return res.status(404).json({
        success: false,
        message: "MSP entry not found",
      });
    }

    res.status(200).json({
      success: true,
      data: updatedMSP,
    });
  } catch (error) {
    console.error("Error updating MSP:", error);
    res.status(500).json({
      success: false,
      message: "Error updating MSP entry",
      error: error.message,
    });
  }
};

// Delete an MSP entry
exports.deleteMSP = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid MSP ID format",
      });
    }

    // Delete the MSP
    const deletedMSP = await MSP.findByIdAndDelete(id);

    if (!deletedMSP) {
      return res.status(404).json({
        success: false,
        message: "MSP entry not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "MSP entry deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting MSP:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting MSP entry",
      error: error.message,
    });
  }
};

// Get MSP chart data (year-wise MSP values)
exports.getMSPChartData = async (req, res) => {
  try {
    // Find MSPs and sort by year
    const msps = await MSP.find().sort({ year: 1 });

    // Format data for chart (year as labels, mspValue as data)
    const chartData = {
      labels: msps.map((msp) => msp.year),
      datasets: [
        {
          label: "MSP Values",
          data: msps.map((msp) => msp.mspValue),
          borderColor: "#4CAF50",
          backgroundColor: "rgba(76, 175, 80, 0.2)",
        },
      ],
    };

    res.status(200).json({
      success: true,
      data: chartData,
    });
  } catch (error) {
    console.error("Error fetching MSP chart data:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving MSP chart data",
      error: error.message,
    });
  }
};

// No need for crop list anymore
