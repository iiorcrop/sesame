// controllers/pestController.js
const PestModel = require("../models/PestModel");
const pestProperty = require("../models/PestProperty");
const { sanitizeInput } = require("../utils/sanitizeInput");
const mongoose = require("mongoose");

// Create a new pest
exports.createpest = async (req, res) => {
  try {
    // Sanitize input data
    const sanitizedData = {
      name: sanitizeInput(req.body.name),
      description: req.body.description
        ? sanitizeInput(req.body.description)
        : undefined,
    };

    // Create new pest
    const newpest = new PestModel(sanitizedData);
    await newpest.save();

    // Create default properties (name and image)
    const defaultProperties = [
      {
        pest: newpest._id,
        name: "name",
        valueType: "text",
        value: sanitizeInput(req.body.defaultName || ""),
      },
      {
        pest: newpest._id,
        name: "image",
        valueType: "image",
        value: req.body.defaultImage || "",
      },
    ];

    await pestProperty.insertMany(defaultProperties);

    res.status(201).json({
      success: true,
      data: newpest,
    });
  } catch (error) {
    // Check for duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "A pest with this name already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error creating pest",
      error: error.message,
    });
  }
};

// Get all pests
exports.getAllpests = async (req, res) => {
  try {
    const pests = await PestModel.find().sort({ name: 1 });

    // Sort pests by createdAt (latest last)
    const sortedPests = pests.sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );

    res.status(200).json({
      success: true,
      count: sortedPests.length,
      data: sortedPests,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error retrieving pests",
      error: error.message,
    });
  }
};

exports.getPestsImages = async (req, res) => {
  try {
    const pests = await PestModel.find();

    console.log(pests);

    const pestsProperties = await pestProperty
      .find({
        pest: { $in: pests.map((pest) => pest._id) },
        valueType: "image",
      })
      .select("value");

    const images = pestsProperties.map((property) => property.value);

    return res.status(200).json({
      success: true,
      count: images.length,
      data: images,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error retrieving pests images",
      error: error.message,
    });
  }
};

// Get a single pest by ID with its properties
exports.getpestById = async (req, res) => {
  try {
    const pestId = req.params.id;

    // Check if ID is valid
    if (!mongoose.Types.ObjectId.isValid(pestId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid pest ID format",
      });
    }

    // Find the pest
    const pest = await PestModel.findById(pestId);

    if (!pest) {
      return res.status(404).json({
        success: false,
        message: "pest not found",
      });
    }

    // Get properties for this pest
    const properties = await pestProperty.find({ pest: pestId });

    // sort properties by createdAt (latest last)
    const sortedProperties = properties.sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );

    res.status(200).json({
      success: true,
      data: {
        pest,
        properties: sortedProperties,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving pest",
      error: error.message,
    });
  }
};

// Update pest
exports.updatepest = async (req, res) => {
  try {
    const pestId = req.params.id;

    // Check if ID is valid
    if (!mongoose.Types.ObjectId.isValid(pestId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid pest ID format",
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

    // Update the pest
    const updatedpest = await PestModel.findByIdAndUpdate(
      pestId,
      sanitizedData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedpest) {
      return res.status(404).json({
        success: false,
        message: "pest not found",
      });
    }

    res.status(200).json({
      success: true,
      data: updatedpest,
    });
  } catch (error) {
    // Check for duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "A pest with this name already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error updating pest",
      error: error.message,
    });
  }
};

// Delete pest and its properties
exports.deletepest = async (req, res) => {
  try {
    const pestId = req.params.id;

    // Check if ID is valid
    if (!mongoose.Types.ObjectId.isValid(pestId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid pest ID format",
      });
    }

    try {
      // Delete the pest
      const deletedpest = await PestModel.findByIdAndDelete(pestId);

      if (!deletedpest) {
        return res.status(404).json({
          success: false,
          message: "pest not found",
        });
      }

      // Delete all properties associated with this pest
      await pestProperty.deleteMany({ pest: pestId });

      res.status(200).json({
        success: true,
        message: "pest and its properties deleted successfully",
      });
    } catch (error) {
      throw error;
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting pest",
      error: error.message,
    });
  }
};

// Create a new property for a pest
exports.createProperty = async (req, res) => {
  try {
    const pestId = req.body.pest;

    // Check if pest ID is valid
    if (!mongoose.Types.ObjectId.isValid(pestId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid pest ID format",
      });
    }

    // Check if pest exists
    const pest = await PestModel.findById(pestId);
    if (!pest) {
      return res.status(404).json({
        success: false,
        message: "pest not found",
      });
    }

    // Sanitize input data - don't sanitize image URLs to prevent encoding slashes
    const valueType = req.body.valueType === "image" ? "image" : "text";
    const sanitizedData = {
      pest: pestId,
      name: sanitizeInput(req.body.name),
      valueType: valueType,
      value:
        valueType === "image" ? req.body.value : sanitizeInput(req.body.value),
    };

    // Create new property
    const newProperty = new pestProperty(sanitizedData);
    await newProperty.save();

    res.status(201).json({
      success: true,
      data: newProperty,
    });
  } catch (error) {
    // Check for duplicate key error (unique constraint on pest and name)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "A property with this name already exists for this pest",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error creating property",
      error: error.message,
    });
  }
};

// Get all properties for a pest
exports.getPropertiesBypest = async (req, res) => {
  try {
    const pestId = req.params.pestId;

    // Check if ID is valid
    if (!mongoose.Types.ObjectId.isValid(pestId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid pest ID format",
      });
    }

    // Check if pest exists
    const pest = await PestModel.findById(pestId);
    if (!pest) {
      return res.status(404).json({
        success: false,
        message: "pest not found",
      });
    }

    // Find all properties for this pest
    const properties = await pestProperty.find({ pest: pestId }).sort({
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
    const property = await pestProperty.findById(propertyId);
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
    const updatedProperty = await pestProperty.findByIdAndUpdate(
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
        message: "A property with this name already exists for this pest",
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
    const deletedProperty = await pestProperty.findByIdAndDelete(propertyId);

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
