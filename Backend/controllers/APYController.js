const APYYear = require("../models/APYYear");
const {
  getAPYDataModel,
  verifyAPYYearDatabase,
} = require("../utils/apyDatabaseHelper");
const {
  parseAPYExcelFile,
  processAPYDataFromFile,
  saveAPYUploadedFile,
} = require("../utils/apyFileParser");
const multer = require("multer");
const fs = require("fs");

// Set up multer for file uploads in memory
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    // Accept xlsx and xls files
    const allowedFileTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];
    const allowedExtensions = [".xlsx", ".xls"];

    // Check mimetype
    if (allowedFileTypes.includes(file.mimetype)) {
      return cb(null, true);
    }

    // Check extension as fallback
    const ext = file.originalname.toLowerCase().split(".").pop();
    if (allowedExtensions.some((e) => `.${ext}` === e)) {
      return cb(null, true);
    }

    cb(new Error("Only Excel files are allowed"));
  },
});

// Middleware to handle file upload
exports.uploadMiddleware = upload.single("apyFile");

// Create a new year for APY data
exports.createYear = async (req, res) => {
  try {
    const { year, description } = req.body;

    // Validate year format (YYYY-YYYY)
    if (!year || !/^\d{4}-\d{4}$/.test(year)) {
      return res.status(400).json({
        success: false,
        message: "Invalid year format. Year must be in format 'YYYY-YYYY'.",
      });
    }

    // Check if the year already exists
    const yearExists = await APYYear.findOne({ year });
    if (yearExists) {
      return res.status(409).json({
        success: false,
        message: `Year ${year} already exists.`,
      });
    }

    // Create the year database
    await verifyAPYYearDatabase(year);

    // Create the year record
    const newYear = new APYYear({
      year,
      description,
    });

    await newYear.save();

    res.status(201).json({
      success: true,
      message: `Year ${year} created successfully.`,
      data: newYear,
    });
  } catch (error) {
    console.error("Error creating APY year:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while creating the APY year.",
      error: error.message,
    });
  }
};

// Get all years
exports.getAllYears = async (req, res) => {
  try {
    const years = await APYYear.find().sort({ year: -1 });

    res.json({
      success: true,
      count: years.length,
      data: years,
    });
  } catch (error) {
    console.error("Error getting APY years:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while retrieving the APY years.",
      error: error.message,
    });
  }
};

// Get a specific year
exports.getYear = async (req, res) => {
  try {
    const year = req.params.year;

    const yearData = await APYYear.findOne({ year });
    if (!yearData) {
      return res.status(404).json({
        success: false,
        message: `Year ${year} not found.`,
      });
    }

    res.json({
      success: true,
      data: yearData,
    });
  } catch (error) {
    console.error(`Error getting APY year ${req.params.year}:`, error);
    res.status(500).json({
      success: false,
      message: "An error occurred while retrieving the APY year.",
      error: error.message,
    });
  }
};

// Delete a year and its associated database
exports.deleteYear = async (req, res) => {
  try {
    const year = req.params.year;

    // Check if the year exists
    const yearData = await APYYear.findOne({ year });
    if (!yearData) {
      return res.status(404).json({
        success: false,
        message: `Year ${year} not found.`,
      });
    }

    // Delete the year record
    await APYYear.deleteOne({ year });

    // Note: Deleting the MongoDB database would require admin privileges
    // and is not typically done through the application
    // Instead, we'll inform the admin to delete it manually if needed

    res.json({
      success: true,
      message: `Year ${year} deleted successfully.`,
    });
  } catch (error) {
    console.error(`Error deleting APY year ${req.params.year}:`, error);
    res.status(500).json({
      success: false,
      message: "An error occurred while deleting the APY year.",
      error: error.message,
    });
  }
};

// Upload APY data from Excel file
exports.uploadAPYData = async (req, res) => {
  try {
    const { year } = req.params;

    // Check if the specified year exists
    const yearData = await APYYear.findOne({ year });
    if (!yearData) {
      return res.status(404).json({
        success: false,
        message: `Year ${year} not found.`,
      });
    }

    // Ensure we have a file
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded.",
      });
    }

    // Save the uploaded file
    const filePath = await saveAPYUploadedFile(req.file);
    console.log(`File saved to ${filePath}`);

    // Parse the file
    const parsedData = await parseAPYExcelFile(filePath);

    // Process the data
    const processedData = processAPYDataFromFile(parsedData);

    // Get the model for this year's data
    const APYDataModel = await getAPYDataModel(year);

    // Delete existing data for this year to avoid duplicates
    await APYDataModel.deleteMany({});

    // Insert all the new data
    if (processedData.length > 0) {
      await APYDataModel.insertMany(processedData);
    }

    res.status(200).json({
      success: true,
      message: `${processedData.length} APY data records imported successfully for ${year}.`,
      count: processedData.length,
    });
  } catch (error) {
    console.error(`Error uploading APY data for ${req.params.year}:`, error);
    res.status(500).json({
      success: false,
      message: "An error occurred while uploading APY data.",
      error: error.message,
    });
  }
};

// Get APY data for a specific year
exports.getAPYDataForYear = async (req, res) => {
  try {
    const { year } = req.params;
    const { state } = req.query;

    // Check if the specified year exists
    const yearData = await APYYear.findOne({ year });
    if (!yearData) {
      return res.status(404).json({
        success: false,
        message: `Year ${year} not found.`,
      });
    }

    // Get the model for this year's data
    const APYDataModel = await getAPYDataModel(year);

    // Build query based on filters
    const query = {};
    if (state) {
      query.state = new RegExp(state, "i"); // case-insensitive search
    }

    // Get the data
    const apyData = await APYDataModel.find(query).sort({ state: 1 });

    res.status(200).json({
      success: true,
      count: apyData.length,
      data: apyData,
    });
  } catch (error) {
    console.error(`Error getting APY data for ${req.params.year}:`, error);
    res.status(500).json({
      success: false,
      message: "An error occurred while retrieving APY data.",
      error: error.message,
    });
  }
};

// Get a single APY data entry by ID
exports.getAPYDataEntryById = async (req, res) => {
  try {
    const { year, dataId } = req.params;

    // Check if the specified year exists
    const yearData = await APYYear.findOne({ year });
    if (!yearData) {
      return res.status(404).json({
        success: false,
        message: `Year ${year} not found.`,
      });
    }

    // Get the model for this year's data
    const APYDataModel = await getAPYDataModel(year);

    // Get the specific data entry
    const apyDataEntry = await APYDataModel.findById(dataId);
    if (!apyDataEntry) {
      return res.status(404).json({
        success: false,
        message: `APY data with ID ${dataId} not found.`,
      });
    }

    res.status(200).json({
      success: true,
      data: apyDataEntry,
    });
  } catch (error) {
    console.error(
      `Error getting APY data entry ${req.params.dataId} for ${req.params.year}:`,
      error
    );
    res.status(500).json({
      success: false,
      message: "An error occurred while retrieving the APY data entry.",
      error: error.message,
    });
  }
};

// Update APY data for a specific entry
exports.updateAPYDataForYear = async (req, res) => {
  try {
    const { year, dataId } = req.params;
    const updateData = req.body;

    // Check if the specified year exists
    const yearData = await APYYear.findOne({ year });
    if (!yearData) {
      return res.status(404).json({
        success: false,
        message: `Year ${year} not found.`,
      });
    }

    // Get the model for this year's data
    const APYDataModel = await getAPYDataModel(year);

    // Check if the data entry exists
    const existingData = await APYDataModel.findById(dataId);
    if (!existingData) {
      return res.status(404).json({
        success: false,
        message: `APY data with ID ${dataId} not found.`,
      });
    }

    // Update allowed fields only (prevent changing importedFrom or createdAt)
    const allowedUpdates = ["state", "area", "production", "productivity"];
    Object.keys(updateData).forEach((key) => {
      if (!allowedUpdates.includes(key)) {
        delete updateData[key];
      }
    });

    // Update the data
    const updatedData = await APYDataModel.findByIdAndUpdate(
      dataId,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "APY data updated successfully.",
      data: updatedData,
    });
  } catch (error) {
    console.error(
      `Error updating APY data entry ${req.params.dataId} for ${req.params.year}:`,
      error
    );
    res.status(500).json({
      success: false,
      message: "An error occurred while updating the APY data entry.",
      error: error.message,
    });
  }
};
