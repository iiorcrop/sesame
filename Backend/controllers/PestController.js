const { initializePestModel } = require("../models/Pest"); // Import the Pest model initialization function

// Create Pest Data (multiple pests at once)
exports.createPest = async (req, res) => {
  try {
    const Pest = await initializePestModel(); // Get the initialized Pest model
    const pestDataArray = req.body; // Expecting an array of pest data objects

    // Validate the input to ensure it's an array and not empty
    if (!Array.isArray(pestDataArray) || pestDataArray.length === 0) {
      return res
        .status(400)
        .json({ message: "Invalid data format or empty array" });
    }

    // Insert multiple pests into the database at once
    const newPests = await Pest.insertMany(pestDataArray);
    res.status(201).json(newPests); // Send the newly created pest data back
  } catch (error) {
    res.status(500).json({ message: "Error creating pest data", error });
  }
};

// Get All Pest Data
exports.getPest = async (req, res) => {
  try {
    const Pest = await initializePestModel(); // Get the initialized Pest model
    const pestData = await Pest.find(); // Fetch all pest data from the database
    console.log(pestData); // Log the fetched data for debugging
    res.status(200).json(pestData); // Return the data as JSON
  } catch (error) {
    console.log("Error fetching pest data:", error); // Log the error for debugging
    res.status(500).json({ message: "Error fetching pest data", error });
  }
};

// Update Pest Data by ID
exports.updatePest = async (req, res) => {
  try {
    const Pest = await initializePestModel(); // Get the initialized Pest model
    const pestId = req.params.id; // Get the pest ID from the request params
    const updatedPest = await Pest.findByIdAndUpdate(pestId, req.body, {
      new: true,
    }); // Update pest data

    if (!updatedPest) {
      return res.status(404).json({ message: "Pest data not found" });
    }

    res.status(200).json(updatedPest); // Return the updated pest data
  } catch (error) {
    res.status(500).json({ message: "Error updating pest data", error });
  }
};

// Delete Pest Data by ID
exports.deletePest = async (req, res) => {
  try {
    const Pest = await initializePestModel(); // Get the initialized Pest model
    const pestId = req.params.id; // Get the pest ID from the request params
    const deletedPest = await Pest.findByIdAndDelete(pestId); // Delete pest data

    if (!deletedPest) {
      return res.status(404).json({ message: "Pest data not found" });
    }

    res.status(200).json({ message: "Pest data deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting pest data", error });
  }
};
