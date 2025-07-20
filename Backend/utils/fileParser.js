const csv = require("csv-parser");
const xlsx = require("xlsx");
const fs = require("fs");
const path = require("path");

/**
 * Parses a CSV file and returns the data as an array of objects
 * @param {string} filePath - Path to the CSV file
 * @returns {Promise<Array>} - Array of parsed CSV data
 */
const parseCSVFile = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => {
        // Process each row of the CSV
        results.push(data);
      })
      .on("end", () => {
        resolve(results);
      })
      .on("error", (error) => {
        reject(error);
      });
  });
};

/**
 * Parses an Excel file and returns the data as an array of objects
 * Skips the first row (title) and uses the second row as header
 * @param {string} filePath - Path to the Excel file
 * @returns {Array} - Array of parsed Excel data
 */
const parseExcelFile = (filePath) => {
  try {
    console.log(`Parsing Excel file: ${filePath}`);

    // Read Excel file - don't convert dates yet, we'll handle it manually
    const workbook = xlsx.readFile(filePath, {
      cellDates: false, // Don't convert dates automatically
    });

    const sheetName = workbook.SheetNames[0]; // Get the first sheet
    const worksheet = workbook.Sheets[sheetName];

    // Get the raw data with row indexes - keep values as raw as possible
    const rawData = xlsx.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: "",
      raw: true, // Keep original raw values
    });

    // Skip the first row (title) and use the second row as headers
    if (rawData.length < 2) {
      throw new Error("Excel file does not have enough rows");
    }

    // Extract headers from the second row (index 1)
    const headers = rawData[1];

    // Map the data starting from the third row (index 2)
    const results = [];
    for (let i = 2; i < rawData.length; i++) {
      const row = rawData[i];
      // Skip empty rows
      if (row.every((cell) => cell === "")) continue;

      const obj = {};
      headers.forEach((header, index) => {
        // Use the header as key and the cell value as value
        if (header && header.trim() !== "") {
          obj[header] = row[index];

          // Debug output for date fields in the first few rows
          if (header === "Reported Date" && i < 5) {
            console.log(
              `Row ${i} Reported Date: ${row[index]} (type: ${typeof row[
                index
              ]})`
            );
          }
        }
      });
      results.push(obj);
    }

    console.log(`Successfully parsed ${results.length} rows from Excel file`);

    // Debug output for the first row
    if (results.length > 0) {
      console.log("First row data:", results[0]);
      console.log(
        "Date format in first row:",
        `Value: ${results[0]["Reported Date"]}`,
        `Type: ${typeof results[0]["Reported Date"]}`
      );
    }

    return results;
  } catch (error) {
    console.error("Excel parsing error:", error);
    throw new Error(`Error parsing Excel file: ${error.message}`);
  }
};

/**
 * Parses a file based on its extension and returns the data as an array of objects
 * @param {string} filePath - Path to the file
 * @returns {Promise<Array>} - Array of parsed data
 */
const parseFile = async (filePath) => {
  const fileExt = path.extname(filePath).toLowerCase();

  switch (fileExt) {
    case ".csv":
      return await parseCSVFile(filePath);
    case ".xlsx":
    case ".xls":
      return parseExcelFile(filePath);
    default:
      throw new Error(`Unsupported file format: ${fileExt}`);
  }
};

/**
 * Processes market data from file format to the MarketData model format
 * @param {Array} fileData - Raw file data
 * @returns {Array} - Formatted market data ready for MongoDB
 */
const processMarketDataFromFile = (fileData) => {
  console.log(fileData[0]);
  return fileData
    .map((row) => {
      // Parse the reported date from various formats
      let reportedDate = new Date();
      try {
        if (row["Reported Date"] && row["Reported Date"] !== "######") {
          // Case 1: If it's already a Date object
          if (row["Reported Date"] instanceof Date) {
            reportedDate = row["Reported Date"];
            reportedDate.setHours(0, 0, 0, 0); // Remove time portion
          }
          // Case 2: If it's a number (Excel serial date)
          else if (typeof row["Reported Date"] === "number") {
            // Excel date formula: (Excel date - 25569) * 86400 * 1000
            // 25569 is the number of days from 1900-01-01 to 1970-01-01
            reportedDate = new Date(
              (row["Reported Date"] - 25569) * 86400 * 1000
            );
            reportedDate.setHours(0, 0, 0, 0); // Remove time portion
            console.log(
              `Converted Excel date ${
                row["Reported Date"]
              } to ${reportedDate.toISOString()}`
            );
          }
          // Case 3: If it's a string with format DD-MM-YY or DD/MM/YY
          else if (typeof row["Reported Date"] === "string") {
            let dateParts;
            // Check if it contains dash or slash
            if (row["Reported Date"].includes("-")) {
              dateParts = row["Reported Date"].split("-");
            } else if (row["Reported Date"].includes("/")) {
              dateParts = row["Reported Date"].split("/");
            }

            if (dateParts && dateParts.length === 3) {
              const [day, month, year] = dateParts;
              // Handle 2-digit year
              const fullYear =
                parseInt(year) < 50
                  ? 2000 + parseInt(year)
                  : 1900 + parseInt(year);
              reportedDate = new Date(
                fullYear,
                parseInt(month) - 1,
                parseInt(day)
              );
              reportedDate.setHours(0, 0, 0, 0); // Remove time portion
            } else {
              // Try standard date parsing as fallback
              const parsedDate = new Date(row["Reported Date"]);
              if (!isNaN(parsedDate.getTime())) {
                reportedDate = parsedDate;
                reportedDate.setHours(0, 0, 0, 0); // Remove time portion
              }
            }
          }
        }
      } catch (error) {
        console.warn(
          `Error parsing date: '${row["Reported Date"]}' (type: ${typeof row[
            "Reported Date"
          ]})`,
          error
        );
        // Keep default date
      }

      // Handle arrivals - remove "Tonnes" text and convert to number
      let arrivals = row["Arrivals (Tonnes)"] || "0";
      if (typeof arrivals === "string") {
        arrivals = arrivals.replace(/tonnes/i, "").trim();
      }

      // Get numeric prices, handling any special formats
      const minPrice = parseFloat(row["Min Price (Rs./Quintal)"] || "0");
      const maxPrice = parseFloat(row["Max Price (Rs./Quintal)"] || "0");
      const modalPrice = parseFloat(row["Modal Price (Rs./Quintal)"] || "0");

      return {
        stateName: row["State Name"] || "",
        districtName: row["District Name"] || "",
        marketName: row["Market Name"] || "",
        variety: row["Variety"] || "",
        group: row["Group"] || "",
        arrivals: arrivals,
        minPrice: isNaN(minPrice) ? 0 : minPrice,
        maxPrice: isNaN(maxPrice) ? 0 : maxPrice,
        modalPrice: isNaN(modalPrice) ? 0 : modalPrice,
        reportedDate: reportedDate,
      };
    })
    .filter(
      (item) =>
        // Filter out rows with missing critical data
        item.stateName && item.districtName && item.marketName
    );
};

/**
 * Saves the uploaded file to the uploads directory
 * @param {Object} file - Express uploaded file object
 * @returns {Promise<string>} - Path to the saved file
 */
const saveUploadedFile = (file) => {
  return new Promise((resolve, reject) => {
    const uploadDir = path.join(__dirname, "../uploads");

    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, `${Date.now()}-${file.originalname}`);

    // Write file to disk
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
  parseFile,
  parseCSVFile,
  parseExcelFile,
  processMarketDataFromFile,
  saveUploadedFile,
};
