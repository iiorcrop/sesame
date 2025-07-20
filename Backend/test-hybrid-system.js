// test-hybrid-system.js
const mongoose = require("mongoose");
const Hybrid = require("./models/Hybrid");
const HybridProperty = require("./models/HybridProperty");

// Test function to verify hybrid system
async function testHybridSystem() {
  try {
    console.log("Testing Hybrid System...");

    // Test 1: Create a hybrid
    console.log("Creating a test hybrid...");
    const testHybrid = new Hybrid({
      name: "Test Hybrid 1",
      description: "This is a test hybrid variety",
    });

    await testHybrid.save();
    console.log("✓ Hybrid created successfully:", testHybrid.name);

    // Test 2: Create properties for the hybrid
    console.log("Creating properties for the hybrid...");
    const properties = [
      {
        hybrid: testHybrid._id,
        name: "yield",
        valueType: "text",
        value: "High yield variety",
      },
      {
        hybrid: testHybrid._id,
        name: "maturity",
        valueType: "text",
        value: "90-95 days",
      },
      {
        hybrid: testHybrid._id,
        name: "image",
        valueType: "image",
        value: "https://example.com/hybrid-image.jpg",
      },
    ];

    await HybridProperty.insertMany(properties);
    console.log("✓ Properties created successfully");

    // Test 3: Retrieve hybrid with properties
    console.log("Retrieving hybrid with properties...");
    const retrievedHybrid = await Hybrid.findById(testHybrid._id);
    const retrievedProperties = await HybridProperty.find({
      hybrid: testHybrid._id,
    });

    console.log("✓ Retrieved hybrid:", retrievedHybrid.name);
    console.log("✓ Retrieved properties:", retrievedProperties.length);

    // Test 4: Clean up
    console.log("Cleaning up test data...");
    await HybridProperty.deleteMany({ hybrid: testHybrid._id });
    await Hybrid.findByIdAndDelete(testHybrid._id);
    console.log("✓ Test data cleaned up");

    console.log("🎉 All tests passed! Hybrid system is working correctly.");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    throw error;
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testHybridSystem()
    .then(() => {
      console.log("Test completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Test failed:", error);
      process.exit(1);
    });
}

module.exports = testHybridSystem;
