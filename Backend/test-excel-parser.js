const {
  parseExcelFile,
  processMarketDataFromFile,
} = require("./utils/fileParser");
const path = require("path");

// Test function to check if the Excel parser works correctly
async function testExcelParser(filePath) {
  try {
    console.log(`Testing Excel parser with file: ${filePath}`);

    // Parse the Excel file
    const data = parseExcelFile(filePath);

    // Log the first few rows to check structure
    console.log("Excel data structure (first 2 rows):");
    console.log(JSON.stringify(data.slice(0, 2), null, 2));

    // Process the data as market data
    const processed = processMarketDataFromFile(data);

    // Log the first few rows of processed data
    console.log("Processed market data (first 2 rows):");
    console.log(JSON.stringify(processed.slice(0, 2), null, 2));

    console.log(`Total raw rows: ${data.length}`);
    console.log(`Total processed rows: ${processed.length}`);

    return { success: true };
  } catch (error) {
    console.error("Error testing Excel parser:", error);
    return { success: false, error: error.message };
  }
}

// If this script is run directly (not imported)
if (require.main === module) {
  // Check if a file path is provided
  const testFilePath = process.argv[2];

  if (!testFilePath) {
    console.error("Please provide an Excel file path as an argument");
    console.error("Example: node test-excel-parser.js ./uploads/test.xlsx");
    process.exit(1);
  }

  // Run the test
  testExcelParser(testFilePath)
    .then((result) => {
      if (result.success) {
        console.log("Test completed successfully");
      } else {
        console.error("Test failed:", result.error);
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error("Unexpected error:", error);
      process.exit(1);
    });
}

module.exports = { testExcelParser };
