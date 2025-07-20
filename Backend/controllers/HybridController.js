// controllers/HybridController.js
const Hybrid = require("../models/Hybrid");
const HybridProperty = require("../models/HybridProperty");
const { sanitizeInput } = require("../utils/sanitizeInput");
const mongoose = require("mongoose");

// Create a new hybrid
exports.createHybrid = async (req, res) => {
  try {
    // Sanitize input data
    const sanitizedData = {
      name: sanitizeInput(req.body.name),
      description: req.body.description
        ? sanitizeInput(req.body.description)
        : undefined,
    };

    // Create new hybrid
    const newHybrid = new Hybrid(sanitizedData);
    await newHybrid.save();

    // Create default properties (name and image)
    const defaultProperties = [
      {
        hybrid: newHybrid._id,
        name: "name",
        valueType: "text",
        value: sanitizeInput(req.body.defaultName || ""),
      },
      {
        hybrid: newHybrid._id,
        name: "image",
        valueType: "image",
        value: req.body.defaultImage || "",
      },
    ];

    await HybridProperty.insertMany(defaultProperties);

    res.status(201).json({
      success: true,
      data: newHybrid,
    });
  } catch (error) {
    console.log("Error creating hybrid:", error);
    // Check for duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "A hybrid with this name already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error creating hybrid",
      error: error.message,
    });
  }
};

// Get all hybrids
exports.getAllHybrids = async (req, res) => {
  try {
    const hybrids = await Hybrid.find().sort({ name: 1 });

    // sort the hybrids by createdAt (latest at the last)
    const data = hybrids.sort(
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
      message: "Error retrieving hybrids",
      error: error.message,
    });
  }
};

// Get a single hybrid by ID with its properties
exports.getHybridById = async (req, res) => {
  try {
    const hybridId = req.params.id;

    // Check if ID is valid
    if (!mongoose.Types.ObjectId.isValid(hybridId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid hybrid ID format",
      });
    }

    // Find the hybrid
    const hybrid = await Hybrid.findById(hybridId);

    if (!hybrid) {
      return res.status(404).json({
        success: false,
        message: "Hybrid not found",
      });
    }

    // Find all properties for this hybrid
    const properties = await HybridProperty.find({ hybrid: hybridId }).sort({
      name: 1,
    });

    res.status(200).json({
      success: true,
      data: {
        hybrid,
        properties,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving hybrid",
      error: error.message,
    });
  }
};

// Update hybrid
exports.updateHybrid = async (req, res) => {
  try {
    const hybridId = req.params.id;

    // Check if ID is valid
    if (!mongoose.Types.ObjectId.isValid(hybridId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid hybrid ID format",
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

    // Update the hybrid
    const updatedHybrid = await Hybrid.findByIdAndUpdate(
      hybridId,
      sanitizedData,
      { new: true, runValidators: true }
    );

    if (!updatedHybrid) {
      return res.status(404).json({
        success: false,
        message: "Hybrid not found",
      });
    }

    res.status(200).json({
      success: true,
      data: updatedHybrid,
    });
  } catch (error) {
    // Check for duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "A hybrid with this name already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error updating hybrid",
      error: error.message,
    });
  }
};

// Delete hybrid
exports.deleteHybrid = async (req, res) => {
  try {
    const hybridId = req.params.id;

    // Check if ID is valid
    if (!mongoose.Types.ObjectId.isValid(hybridId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid hybrid ID format",
      });
    }

    try {
      // Delete the hybrid
      const deletedHybrid = await Hybrid.findByIdAndDelete(hybridId);

      if (!deletedHybrid) {
        return res.status(404).json({
          success: false,
          message: "Hybrid not found",
        });
      }

      // Delete all properties associated with this hybrid
      await HybridProperty.deleteMany({ hybrid: hybridId });

      res.status(200).json({
        success: true,
        message: "Hybrid and its properties deleted successfully",
      });
    } catch (error) {
      throw error;
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting hybrid",
      error: error.message,
    });
  }
};

// Create a new property for a hybrid
exports.createProperty = async (req, res) => {
  try {
    const hybridId = req.body.hybrid;

    // Check if hybrid ID is valid
    if (!mongoose.Types.ObjectId.isValid(hybridId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid hybrid ID format",
      });
    }

    // Check if hybrid exists
    const hybrid = await Hybrid.findById(hybridId);
    if (!hybrid) {
      return res.status(404).json({
        success: false,
        message: "Hybrid not found",
      });
    }

    // Sanitize input data - don't sanitize image URLs to prevent encoding slashes
    const valueType = req.body.valueType === "image" ? "image" : "text";
    const sanitizedData = {
      hybrid: hybridId,
      name: sanitizeInput(req.body.name),
      valueType: valueType,
      value:
        valueType === "image" ? req.body.value : sanitizeInput(req.body.value),
    };

    // Create new property
    const newProperty = new HybridProperty(sanitizedData);
    await newProperty.save();

    res.status(201).json({
      success: true,
      data: newProperty,
    });
  } catch (error) {
    // Check for duplicate key error (unique constraint on hybrid and name)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "A property with this name already exists for this hybrid",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error creating property",
      error: error.message,
    });
  }
};

// Get all properties for a hybrid
exports.getPropertiesByHybrid = async (req, res) => {
  try {
    const hybridId = req.params.hybridId;

    // Check if ID is valid
    if (!mongoose.Types.ObjectId.isValid(hybridId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid hybrid ID format",
      });
    }

    // Check if hybrid exists
    const hybrid = await Hybrid.findById(hybridId);
    if (!hybrid) {
      return res.status(404).json({
        success: false,
        message: "Hybrid not found",
      });
    }

    // Find all properties for this hybrid
    const properties = await HybridProperty.find({ hybrid: hybridId }).sort({
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
    const property = await HybridProperty.findById(propertyId);
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
    const updatedProperty = await HybridProperty.findByIdAndUpdate(
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
        message: "A property with this name already exists for this hybrid",
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
    const deletedProperty = await HybridProperty.findByIdAndDelete(propertyId);

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

exports.getHybridsImages = async (req, res) => {
  try {
    const hybrids = await Hybrid.find();

    if (!hybrids || hybrids.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No hybrids found",
      });
    }

    // Map to get only the images
    const properties = await HybridProperty.find({
      hybrid: { $in: hybrids.map((h) => h._id) },
      valueType: "image",
    }).select("value");

    const images = properties.map((property) => property.value);

    return res.status(200).json({
      success: true,
      count: images.length,
      data: images,
    });
  } catch (error) {
    console.error("Error retrieving hybrid images:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving hybrid images",
      error: error.message,
    });
  }
};
