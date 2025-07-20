const csv = require("csv-parser");
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
 * Processes market data from CSV format to the MarketData model format
 * @param {Array} csvData - Raw CSV data
 * @returns {Array} - Formatted market data ready for MongoDB
 */
const processMarketDataFromCSV = (csvData) => {
  return csvData
    .map((row) => {
      // Parse the reported date from 'DD/MM/YY' format to a Date object
      let reportedDate = new Date();
      if (row["Reported Date"] && row["Reported Date"] !== "######") {
        const [day, month, year] = row["Reported Date"].split("/");
        // Note: This assumes 2-digit year format
        const fullYear =
          parseInt(year) < 50 ? 2000 + parseInt(year) : 1900 + parseInt(year);
        reportedDate = new Date(fullYear, parseInt(month) - 1, parseInt(day));
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
        grade: row["Grade"] || "",
      };
    })
    .filter(
      (item) =>
        // Filter out rows with missing critical data
        item.stateName && item.districtName && item.marketName
    );
};

/**
 * Saves the uploaded CSV file to the uploads directory
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
  parseCSVFile,
  processMarketDataFromCSV,
  saveUploadedFile,
};
