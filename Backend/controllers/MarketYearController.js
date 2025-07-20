const MarketYear = require("../models/MarketYear");
const {
  getMarketDataModel,
  verifyYearDatabase,
} = require("../utils/yearDatabaseHelper");
const {
  parseFile,
  processMarketDataFromFile,
  saveUploadedFile,
} = require("../utils/fileParser");
const multer = require("multer");
const fs = require("fs");

// Set up multer for file uploads in memory
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    // Accept csv, xlsx and xls files
    const allowedFileTypes = [
      "text/csv",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];
    const allowedExtensions = [".csv", ".xlsx", ".xls"];

    // Check mimetype
    if (allowedFileTypes.includes(file.mimetype)) {
      return cb(null, true);
    }

    // Check extension as fallback
    const ext = file.originalname.toLowerCase().split(".").pop();
    if (allowedExtensions.some((e) => `.${ext}` === e)) {
      return cb(null, true);
    }

    cb(new Error("Only CSV or Excel files are allowed"));
  },
});

// Create a new year for market data
exports.createYear = async (req, res) => {
  try {
    const { year, description } = req.body;

    // Validate year format
    if (!year || !/^\d{4}$/.test(year)) {
      return res.status(400).json({
        success: false,
        message: "Invalid year format. Year must be a 4-digit number.",
      });
    }

    // Check if year already exists
    const existingYear = await MarketYear.findOne({ year });
    if (existingYear) {
      return res.status(409).json({
        success: false,
        message: `Year ${year} already exists`,
      });
    }

    // Create the year database
    await verifyYearDatabase(year);

    // Create the year record in the main database
    const newYear = new MarketYear({
      year,
      description: description || `Market data for year ${year}`,
    });

    const savedYear = await newYear.save();

    res.status(201).json({
      success: true,
      data: savedYear,
      message: `Successfully created year ${year} and its database`,
    });
  } catch (error) {
    console.error("Error creating year:", error);
    res.status(500).json({
      success: false,
      message: "Error creating year",
      error: error.message,
    });
  }
};

// Get all years
exports.getAllYears = async (req, res) => {
  try {
    const years = await MarketYear.find().sort({ year: -1 });

    res.status(200).json({
      success: true,
      count: years.length,
      data: years,
    });
  } catch (error) {
    console.error("Error fetching years:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching years",
      error: error.message,
    });
  }
};

// Get a specific year
exports.getYear = async (req, res) => {
  try {
    const { year } = req.params;

    const yearData = await MarketYear.findOne({ year });

    if (!yearData) {
      return res.status(404).json({
        success: false,
        message: `Year ${year} not found`,
      });
    }

    res.status(200).json({
      success: true,
      data: yearData,
    });
  } catch (error) {
    console.error(`Error fetching year ${req.params.year}:`, error);
    res.status(500).json({
      success: false,
      message: "Error fetching year",
      error: error.message,
    });
  }
};

// Delete a year
exports.deleteYear = async (req, res) => {
  try {
    const { year } = req.params;

    const yearData = await MarketYear.findOneAndDelete({ year });

    if (!yearData) {
      return res.status(404).json({
        success: false,
        message: `Year ${year} not found`,
      });
    }

    // Note: We're not actually deleting the database here,
    // just removing the record from our system.
    // Deleting MongoDB databases requires admin privileges
    // which is typically not recommended in production apps.

    res.status(200).json({
      success: true,
      message: `Year ${year} has been removed from the system`,
      data: yearData,
    });
  } catch (error) {
    console.error(`Error deleting year ${req.params.year}:`, error);
    res.status(500).json({
      success: false,
      message: "Error deleting year",
      error: error.message,
    });
  }
};

exports.uploadMarketData = async (req, res) => {
  try {
    const { year } = req.params;

    console.log(
      `Processing file upload for year ${year}:`,
      req.file?.originalname
    );

    const yearExists = await MarketYear.findOne({ year });
    if (!yearExists) {
      return res.status(404).json({
        success: false,
        message: `Year ${year} not found. Create the year first.`,
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const filePath = await saveUploadedFile(req.file);
    const fileData = await parseFile(filePath);
    const processedData = processMarketDataFromFile(fileData);

    console.log(`Processed data from ${req.file.originalname}`);

    if (processedData.length === 0) {
      fs.unlinkSync(filePath);
      return res.status(400).json({
        success: false,
        message: "No valid data found in the uploaded file",
      });
    }

    const MarketDataModel = await getMarketDataModel(year);

    // Define uniqueness criteria — adjust these fields as needed
    const uniqueKeys = ["marketName", "reportedDate", "variety", "group"];

    // Remove duplicates by checking DB
    const filteredData = [];
    for (const row of processedData) {
      const query = {};
      for (const key of uniqueKeys) {
        query[key] = row[key];
      }

      const exists = await MarketDataModel.exists(query);
      if (!exists) {
        filteredData.push(row);
      }
    }

    console.log(
      `Filtered ${filteredData.length} new unique records out of ${processedData.length}`
    );

    if (filteredData.length === 0) {
      fs.unlinkSync(filePath);
      return res.status(200).json({
        success: true,
        message:
          "All records in the uploaded file are duplicates; nothing new to import.",
        count: 0,
      });
    }

    const insertedData = await MarketDataModel.insertMany(filteredData);

    fs.unlinkSync(filePath);

    console.log("uplaoded");

    res.status(200).json({
      success: true,
      message: `Successfully imported ${insertedData.length} records for year ${year}`,
      count: insertedData.length,
    });
  } catch (error) {
    console.error(
      `Error uploading market data for year ${req.params.year}:`,
      error
    );
    res.status(500).json({
      success: false,
      message: "Error uploading market data",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// Get market data for a specific year
exports.getMarketDataForYear = async (req, res) => {
  try {
    const { year } = req.params;
    const { page = 1, limit = 100, ...filters } = req.query;

    console.log(`Fetching market data for year ${year} with filters:`, filters);

    // Log the raw query URL for debugging
    console.log(`Raw query URL params:`, req.query);

    // Check if the year exists
    const yearExists = await MarketYear.findOne({ year });
    if (!yearExists) {
      return res.status(404).json({
        success: false,
        message: `Year ${year} not found`,
      });
    }

    // Build query filters
    const query = {};

    // Add any filters from query params
    Object.keys(filters).forEach((key) => {
      // Handle special case filters
      if (key === "date" && filters[key]) {
        query.reportedDate = new Date(filters[key]);
      } else if (
        (key === "dateFrom" || key === "reportedDateFrom") &&
        filters[key]
      ) {
        query.reportedDate = {
          ...(query.reportedDate || {}),
          $gte: new Date(filters[key]),
        };
      } else if (
        (key === "dateTo" || key === "reportedDateTo") &&
        filters[key]
      ) {
        query.reportedDate = {
          ...(query.reportedDate || {}),
          $lte: new Date(filters[key]),
        };
      } else if (
        ["stateName", "districtName", "marketName"].includes(key) &&
        filters[key]
      ) {
        // Handle comma-separated values for multi-select filters
        const values = filters[key].split(",");
        if (values.length > 1) {
          query[key] = { $in: values };
        } else {
          // For single value, use regex for case-insensitive search
          query[key] = { $regex: filters[key], $options: "i" };
        }
      } else if (filters[key]) {
        // For text fields, use case-insensitive regex search
        query[key] = { $regex: filters[key], $options: "i" };
      }
    });

    console.log(`Built query filters:`, query);

    // Debug log for date filters
    if (query.reportedDate) {
      console.log("Date filter details:", {
        filter: query.reportedDate,
        fromDate: query.reportedDate.$gte
          ? query.reportedDate.$gte.toISOString()
          : "not set",
        toDate: query.reportedDate.$lte
          ? query.reportedDate.$lte.toISOString()
          : "not set",
      });
    }

    // Get the model for this year
    const MarketDataModel = await getMarketDataModel(year);
    console.log(`Successfully got MarketDataModel for year ${year}`);

    // Calculate pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Execute the query with pagination
    const data = await MarketDataModel.find(query)
      .skip(skip)
      .limit(limitNum)
      .sort({ reportedDate: 1 }); // Sort from oldest to newest

    // Get total count
    const total = await MarketDataModel.countDocuments(query);

    console.log(
      `Found ${data.length} records out of ${total} total for year ${year}`
    );

    // sort data by reportedData from last to new

    res.status(200).json({
      success: true,
      count: data.length,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      data: data,
    });
  } catch (error) {
    console.error(
      `Error fetching market data for year ${req.params.year}:`,
      error
    );
    res.status(500).json({
      success: false,
      message: "Error fetching market data",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// Update market data for a specific year
exports.updateMarketDataForYear = async (req, res) => {
  try {
    const { year } = req.params;
    const { dataId } = req.params;
    const updateData = req.body;

    console.log(`Updating market data ID ${dataId} for year ${year}`);

    // Check if the year exists
    const yearExists = await MarketYear.findOne({ year });
    if (!yearExists) {
      return res.status(404).json({
        success: false,
        message: `Year ${year} not found`,
      });
    }

    // Get the model for this year
    const MarketDataModel = await getMarketDataModel(year);

    // Find and update the document
    const updatedDocument = await MarketDataModel.findByIdAndUpdate(
      dataId,
      updateData,
      { new: true } // Return the updated document
    );

    if (!updatedDocument) {
      return res.status(404).json({
        success: false,
        message: `Market data with ID ${dataId} not found for year ${year}`,
      });
    }

    res.status(200).json({
      success: true,
      message: `Successfully updated market data for year ${year}`,
      data: updatedDocument,
    });
  } catch (error) {
    console.error(
      `Error updating market data for year ${req.params.year}:`,
      error
    );
    res.status(500).json({
      success: false,
      message: "Error updating market data",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// Get single market data entry by ID for a specific year
exports.getMarketDataEntryById = async (req, res) => {
  try {
    const { year, dataId } = req.params;

    console.log(`Fetching market data entry ID ${dataId} for year ${year}`);

    // Check if the year exists
    const yearExists = await MarketYear.findOne({ year });
    if (!yearExists) {
      return res.status(404).json({
        success: false,
        message: `Year ${year} not found`,
      });
    }

    // Get the model for this year
    const MarketDataModel = await getMarketDataModel(year);

    // Find the document by ID
    const dataEntry = await MarketDataModel.findById(dataId);

    if (!dataEntry) {
      return res.status(404).json({
        success: false,
        message: `Market data with ID ${dataId} not found for year ${year}`,
      });
    }

    res.status(200).json({
      success: true,
      data: dataEntry,
    });
  } catch (error) {
    console.error(
      `Error fetching market data entry for year ${req.params.year}:`,
      error
    );
    res.status(500).json({
      success: false,
      message: "Error fetching market data entry",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

exports.getMarketDataFilters = async (req, res) => {
  try {
    const { year } = req.params;
    const { stateName, districtName } = req.query;

    console.log(`Fetching market data filters for year ${year} with filters:`, {
      stateName,
      districtName,
    });

    // Check if the year exists
    const yearExists = await MarketYear.findOne({ year });
    if (!yearExists) {
      return res.status(404).json({
        success: false,
        message: `Year ${year} not found`,
      });
    }

    const MarketDataModel = await getMarketDataModel(year);
    console.log(`Successfully got MarketDataModel for year ${year}`);

    // Build filter query for cascading filters
    let filterQuery = {};

    // Apply state filter for districts and markets
    if (stateName) {
      filterQuery.stateName = { $in: stateName.split(",") };
    }

    // Apply district filter for markets (in addition to state filter)
    let marketFilterQuery = { ...filterQuery };
    if (districtName) {
      marketFilterQuery.districtName = { $in: districtName.split(",") };
    }

    const filters = {
      stateName: await MarketDataModel.distinct("stateName"),
      districtName: await MarketDataModel.distinct("districtName", filterQuery),
      marketName: await MarketDataModel.distinct(
        "marketName",
        marketFilterQuery
      ),
      variety: await MarketDataModel.distinct("variety"),
      groups: await MarketDataModel.distinct("group"),
    };

    res.status(200).json({
      success: true,
      message: `Successfully fetched market data filters for year ${year}`,
      filters,
    });
  } catch (error) {
    console.error(
      `Error fetching market data filters for year ${req.params.year}:`,
      error
    );
    res.status(500).json({
      success: false,
      message: "Error fetching market data filters",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// Export the upload middleware to be used in routes
exports.uploadMiddleware = upload.single("file");
