const xlsx = require("xlsx");
const fs = require("fs");
const path = require("path");

/**
 * Parses an APY Excel file and returns the data as an array of objects
 * @param {string} filePath - Path to the Excel file
 * @returns {Array} - Array of parsed Excel data
 */
const parseAPYExcelFile = (filePath) => {
  try {
    console.log(`Parsing APY Excel file: ${filePath}`);

    // Read Excel file
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0]; // Get the first sheet
    const worksheet = workbook.Sheets[sheetName];

    // Convert sheet to JSON
    const rawData = xlsx.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: "",
      raw: true,
    });

    // Skip any empty rows at the beginning
    let dataStartRow = 0;
    while (dataStartRow < rawData.length) {
      if (
        rawData[dataStartRow].some(
          (cell) => cell === "States/UT" || cell === "State"
        )
      ) {
        break;
      }
      dataStartRow++;
    }

    if (dataStartRow >= rawData.length) {
      throw new Error("Could not find header row in Excel file");
    }

    // Get headers (expecting to find "States/UT", "Area", "Production", "Productivity")
    const headerRow = rawData[dataStartRow];
    const headers = headerRow.map((h) => String(h).trim());

    // Find column indexes
    const stateColIndex = headers.findIndex(
      (h) => h === "States/UT" || h === "State"
    );
    const areaColIndex = headers.findIndex((h) => h.includes("Area"));
    const productionColIndex = headers.findIndex((h) =>
      h.includes("Production")
    );
    const productivityColIndex = headers.findIndex((h) =>
      h.includes("Productivity")
    );

    if (
      stateColIndex === -1 ||
      areaColIndex === -1 ||
      productionColIndex === -1 ||
      productivityColIndex === -1
    ) {
      throw new Error("Required columns not found in Excel file");
    }

    // Map the data starting from the row after headers
    const results = [];
    for (let i = dataStartRow + 1; i < rawData.length; i++) {
      const row = rawData[i];

      // Skip empty rows
      if (
        !row ||
        row.length === 0 ||
        (row[stateColIndex] === "" && row[areaColIndex] === "")
      ) {
        continue;
      }

      // Skip totals row labeled as "India" or any other summary rows
      if (
        row[stateColIndex] === "India" ||
        row[stateColIndex] === "All India" ||
        row[stateColIndex] === "Total" ||
        row[stateColIndex] === "Grand Total"
      ) {
        continue;
      }

      const apyData = {
        state: row[stateColIndex],
        area: parseNumberValue(row[areaColIndex]),
        production: parseNumberValue(row[productionColIndex]),
        productivity: parseNumberValue(row[productivityColIndex]),
      };

      // Add only if state name exists
      if (apyData.state && apyData.state.trim() !== "") {
        results.push(apyData);
      }
    }

    console.log(
      `Successfully parsed ${results.length} rows from APY Excel file`
    );

    // Debug output for the first row
    if (results.length > 0) {
      console.log("First row data:", results[0]);
    }

    return results;
  } catch (error) {
    console.error("Error parsing Excel file:", error);
    throw error;
  }
};

/**
 * Parses a number value from Excel, handling different formats
 * @param {any} value - The value to parse
 * @returns {Number|null} - Parsed number or null if invalid
 */
const parseNumberValue = (value) => {
  if (value === undefined || value === null || value === "") return null;

  // If already a number, return it
  if (typeof value === "number") return value;

  // Try to parse as a number
  const parsed = parseFloat(String(value).replace(/,/g, ""));
  return isNaN(parsed) ? null : parsed;
};

/**
 * Process APY data from Excel file and prepare it for database entry
 * @param {Array} data - Parsed Excel data
 * @returns {Array} - Processed data ready for database insertion
 */
const processAPYDataFromFile = (data) => {
  return data.map((item) => ({
    state: item.state.trim(),
    area: item.area,
    production: item.production,
    productivity: item.productivity,
    importedFrom: "Excel",
    createdAt: new Date(),
  }));
};

/**
 * Save the uploaded file to disk
 * @param {Object} file - The uploaded file object
 * @returns {Promise<string>} - Path to the saved file
 */
const saveAPYUploadedFile = async (file) => {
  const timestamp = Date.now();
  const fileName = `${timestamp}-${file.originalname}`;
  const uploadDir = path.join(__dirname, "../uploads");

  // Ensure uploads directory exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const filePath = path.join(uploadDir, fileName);

  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, file.buffer, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(filePath);
      }
    });
  });
};

module.exports = {
  parseAPYExcelFile,
  processAPYDataFromFile,
  saveAPYUploadedFile,
};
