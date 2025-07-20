// controllers/DiseaseController.js
const Disease = require("../models/Disease");
const DiseaseProperty = require("../models/DiseaseProperty");
const { sanitizeInput } = require("../utils/sanitizeInput");
const mongoose = require("mongoose");

// Create a new disease
exports.createDisease = async (req, res) => {
  try {
    // Sanitize input data
    const sanitizedData = {
      name: sanitizeInput(req.body.name),
      description: req.body.description
        ? sanitizeInput(req.body.description)
        : undefined,
    };

    // Create new disease
    const newDisease = new Disease(sanitizedData);
    await newDisease.save();

    // Create default properties (name and image)
    const defaultProperties = [
      {
        disease: newDisease._id,
        name: "name",
        valueType: "text",
        value: sanitizeInput(req.body.defaultName || ""),
      },
      {
        disease: newDisease._id,
        name: "image",
        valueType: "image",
        value: req.body.defaultImage || "",
      },
    ];

    await DiseaseProperty.insertMany(defaultProperties);

    res.status(201).json({
      success: true,
      data: newDisease,
    });
  } catch (error) {
    console.log("Error creating disease:", error);
    // Check for duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "A disease with this name already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error creating disease",
      error: error.message,
    });
  }
};

// Get all diseases
exports.getAllDiseases = async (req, res) => {
  try {
    const diseases = await Disease.find().sort({ name: 1 });

    // sort the diseases by createdAt (latest at the last)

    const data = diseases.sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );

    res.status(200).json({
      success: true,
      count: data.length,
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving diseases",
      error: error.message,
    });
  }
};

// Get a single disease by ID with its properties
exports.getDiseaseById = async (req, res) => {
  try {
    const diseaseId = req.params.id;

    // Check if ID is valid
    if (!mongoose.Types.ObjectId.isValid(diseaseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid disease ID format",
      });
    }

    // Find the disease
    const disease = await Disease.findById(diseaseId);

    if (!disease) {
      return res.status(404).json({
        success: false,
        message: "Disease not found",
      });
    }

    // Get properties for this disease
    const properties = await DiseaseProperty.find({ disease: diseaseId });

    // sort properties by createdAt (latest at the last)

    const sortedProperties = properties.sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );

    res.status(200).json({
      success: true,
      data: {
        disease,
        properties: sortedProperties,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving disease",
      error: error.message,
    });
  }
};

// Update disease
exports.updateDisease = async (req, res) => {
  try {
    const diseaseId = req.params.id;

    // Check if ID is valid
    if (!mongoose.Types.ObjectId.isValid(diseaseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid disease ID format",
      });
    }

    // Sanitize input data
    const sanitizedData = {
      name: req.body.name ? sanitizeInput(req.body.name) : undefined,
      description: req.body.description
        ? sanitizeInput(req.body.description)
        : undefined,
      updatedAt: Date.now(),
    };

    // Remove undefined fields
    Object.keys(sanitizedData).forEach(
      (key) => sanitizedData[key] === undefined && delete sanitizedData[key]
    );

    // Update the disease
    const updatedDisease = await Disease.findByIdAndUpdate(
      diseaseId,
      sanitizedData,
      { new: true, runValidators: true }
    );

    if (!updatedDisease) {
      return res.status(404).json({
        success: false,
        message: "Disease not found",
      });
    }

    res.status(200).json({
      success: true,
      data: updatedDisease,
    });
  } catch (error) {
    // Check for duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "A disease with this name already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error updating disease",
      error: error.message,
    });
  }
};

// Delete disease and its properties
exports.deleteDisease = async (req, res) => {
  try {
    const diseaseId = req.params.id;

    // Check if ID is valid
    if (!mongoose.Types.ObjectId.isValid(diseaseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid disease ID format",
      });
    }

    try {
      // Delete the disease
      const deletedDisease = await Disease.findByIdAndDelete(diseaseId);

      if (!deletedDisease) {
        return res.status(404).json({
          success: false,
          message: "Disease not found",
        });
      }

      // Delete all properties associated with this disease
      await DiseaseProperty.deleteMany({ disease: diseaseId });

      res.status(200).json({
        success: true,
        message: "Disease and its properties deleted successfully",
      });
    } catch (error) {
      throw error;
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting disease",
      error: error.message,
    });
  }
};

// Create a new property for a disease
exports.createProperty = async (req, res) => {
  try {
    const diseaseId = req.body.disease;

    // Check if disease ID is valid
    if (!mongoose.Types.ObjectId.isValid(diseaseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid disease ID format",
      });
    }

    // Check if disease exists
    const disease = await Disease.findById(diseaseId);
    if (!disease) {
      return res.status(404).json({
        success: false,
        message: "Disease not found",
      });
    }

    // Sanitize input data - don't sanitize image URLs to prevent encoding slashes
    const valueType = req.body.valueType === "image" ? "image" : "text";
    const sanitizedData = {
      disease: diseaseId,
      name: sanitizeInput(req.body.name),
      valueType: valueType,
      value:
        valueType === "image" ? req.body.value : sanitizeInput(req.body.value),
    };

    // Create new property
    const newProperty = new DiseaseProperty(sanitizedData);
    await newProperty.save();

    res.status(201).json({
      success: true,
      data: newProperty,
    });
  } catch (error) {
    // Check for duplicate key error (unique constraint on disease and name)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "A property with this name already exists for this disease",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error creating property",
      error: error.message,
    });
  }
};

// Get all properties for a disease
exports.getPropertiesByDisease = async (req, res) => {
  try {
    const diseaseId = req.params.diseaseId;

    // Check if ID is valid
    if (!mongoose.Types.ObjectId.isValid(diseaseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid disease ID format",
      });
    }

    // Check if disease exists
    const disease = await Disease.findById(diseaseId);
    if (!disease) {
      return res.status(404).json({
        success: false,
        message: "Disease not found",
      });
    }

    // Find all properties for this disease
    const properties = await DiseaseProperty.find({ disease: diseaseId }).sort({
      name: 1,
    });

    res.status(200).json({
      success: true,
      count: properties.length,
      data: properties,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving properties",
      error: error.message,
    });
  }
};

// Update property
exports.updateProperty = async (req, res) => {
  try {
    const propertyId = req.params.id;

    // Check if ID is valid
    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid property ID format",
      });
    }

    // Check if property exists
    const property = await DiseaseProperty.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    // Determine if the value is an image URL
    const isImage =
      req.body.valueType === "image" ||
      (property.valueType === "image" && !req.body.valueType);

    // Sanitize input data - don't sanitize image URLs to prevent encoding slashes
    const sanitizedData = {
      name: req.body.name ? sanitizeInput(req.body.name) : undefined,
      valueType: req.body.valueType ? req.body.valueType : undefined,
      value: req.body.value
        ? isImage
          ? req.body.value
          : sanitizeInput(req.body.value)
        : undefined,
      updatedAt: Date.now(),
    };

    // Remove undefined fields
    Object.keys(sanitizedData).forEach(
      (key) => sanitizedData[key] === undefined && delete sanitizedData[key]
    );

    // Update the property
    const updatedProperty = await DiseaseProperty.findByIdAndUpdate(
      propertyId,
      sanitizedData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: updatedProperty,
    });
  } catch (error) {
    // Check for duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "A property with this name already exists for this disease",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error updating property",
      error: error.message,
    });
  }
};

// Delete property
exports.deleteProperty = async (req, res) => {
  try {
    const propertyId = req.params.id;

    // Check if ID is valid
    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid property ID format",
      });
    }

    // Delete the property
    const deletedProperty = await DiseaseProperty.findByIdAndDelete(propertyId);

    if (!deletedProperty) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Property deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting property",
      error: error.message,
    });
  }
};

exports.getDiseasesImages = async (req, res) => {
  try {
    const diseases = await Disease.find();

    if (!diseases || diseases.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No diseases found",
      });
    }

    // Map to get only the images
    const properties = await DiseaseProperty.find({
      disease: { $in: diseases.map((d) => d._id) },
      valueType: "image",
    }).select("value");

    const images = properties.map((property) => property.value);

    return res.status(200).json({
      success: true,
      count: images.length,
      data: images,
    });
  } catch (error) {
    console.error("Error retrieving disease images:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving disease images",
      error: error.message,
    });
  }
};
