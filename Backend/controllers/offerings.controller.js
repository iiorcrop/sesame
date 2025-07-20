const OfferingModel = require("../models/OfferingModel");

exports.createOffering = async (req, res) => {
  try {
    const { type, content, image, date } = req.body;

    // Validate required fields
    if (!type || !content || !date) {
      return res.status(400).json({
        message: "Type, content, and date are required fields.",
      });
    }

    // Create a new offering instance
    const newOffering = await OfferingModel.create({
      type,
      content,
      image: image || null, // Optional field, default to null if not provided
      date: new Date(date), // Ensure date is a Date object
    });

    res.status(201).json({
      message: "Offering created successfully",
      offering: newOffering,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating offering", error: error.message });
  }
};

exports.getOfferings = async (req, res) => {
  try {
    const { type, limit, page } = req.query;

    // Pagination and filtering logic
    const query = {};
    if (type) {
      query.type = type;
    }
    const offeringsPerPage = parseInt(limit) || 10; // Default to 10 if not specified
    const currentPage = parseInt(page) || 1; // Default to page 1
    const skip = (currentPage - 1) * offeringsPerPage;
    const offerings = await OfferingModel.find(query)
      .skip(skip)
      .limit(offeringsPerPage)
      .sort({ date: -1 }); // Sort by date descending

    res.status(200).json({
      message: "Offerings retrieved successfully",
      offerings,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving offerings",
      error: error.message,
    });
  }
};

exports.getOfferingById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!id) {
      return res.status(400).json({ message: "Offering ID is required." });
    }

    const offering = await OfferingModel.findById(id);
    if (!offering) {
      return res.status(404).json({ message: "Offering not found." });
    }

    res.status(200).json({
      message: "Offering retrieved successfully",
      offering,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving offering",
      error: error.message,
    });
  }
};

exports.updateOffering = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, content, image, date } = req.body;

    // Validate ID format
    if (!id) {
      return res.status(400).json({ message: "Offering ID is required." });
    }

    // Find and update the offering
    const updatedOffering = await OfferingModel.findByIdAndUpdate(
      id,
      { type, content, image, date: new Date(date) },
      { new: true } // Return the updated document
    );

    if (!updatedOffering) {
      return res.status(404).json({ message: "Offering not found." });
    }

    res.status(200).json({
      message: "Offering updated successfully",
      offering: updatedOffering,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating offering",
      error: error.message,
    });
  }
};

exports.deleteOffering = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!id) {
      return res.status(400).json({ message: "Offering ID is required." });
    }

    const deletedOffering = await OfferingModel.findByIdAndDelete(id);
    if (!deletedOffering) {
      return res.status(404).json({ message: "Offering not found." });
    }

    res.status(200).json({
      message: "Offering deleted successfully",
      offering: deletedOffering,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting offering",
      error: error.message,
    });
  }
};
