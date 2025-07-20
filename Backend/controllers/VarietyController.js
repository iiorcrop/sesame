// controllers/VarietyController.js
const Variety = require("../models/Variety");
const Property = require("../models/Property");
const { sanitizeInput } = require("../utils/sanitizeInput");
const mongoose = require("mongoose");

// Create a new variety
exports.createVariety = async (req, res) => {
  try {
    // Sanitize input data
    const sanitizedData = {
      name: sanitizeInput(req.body.name),
      description: req.body.description
        ? sanitizeInput(req.body.description)
        : undefined,
    };

    // Create new variety
    const newVariety = new Variety(sanitizedData);
    await newVariety.save();

    res.status(201).json({
      success: true,
      data: newVariety,
    });
  } catch (error) {
    // Check for duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "A variety with this name already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error creating variety",
      error: error.message,
    });
  }
};

// Get all varieties
exports.getAllVarieties = async (req, res) => {
  try {
    const varieties = await Variety.find().sort({ name: 1 });

    // sort varieties by createdAt (latest last)
    const sortedData = varieties.sort((a, b) => {
      return new Date(a.createdAt) - new Date(b.createdAt);
    });

    res.status(200).json({
      success: true,
      count: sortedData.length,
      data: sortedData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving varieties",
      error: error.message,
    });
  }
};

// Get a single variety by ID with its properties
exports.getVarietyById = async (req, res) => {
  try {
    const varietyId = req.params.id;

    // Check if ID is valid
    if (!mongoose.Types.ObjectId.isValid(varietyId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid variety ID format",
      });
    }

    // Find the variety
    const variety = await Variety.findById(varietyId);

    if (!variety) {
      return res.status(404).json({
        success: false,
        message: "Variety not found",
      });
    }

    // Get properties for this variety
    const properties = await Property.find({ variety: varietyId });

    // sort properties by createdAt (latest last)
    const sortedProperties = properties.sort((a, b) => {
      return new Date(a.createdAt) - new Date(b.createdAt);
    });

    res.status(200).json({
      success: true,
      data: {
        variety,
        properties: sortedProperties,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving variety",
      error: error.message,
    });
  }
};

// Update variety
exports.updateVariety = async (req, res) => {
  try {
    const varietyId = req.params.id;

    // Check if ID is valid
    if (!mongoose.Types.ObjectId.isValid(varietyId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid variety ID format",
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

    // Update the variety
    const updatedVariety = await Variety.findByIdAndUpdate(
      varietyId,
      sanitizedData,
      { new: true, runValidators: true }
    );

    if (!updatedVariety) {
      return res.status(404).json({
        success: false,
        message: "Variety not found",
      });
    }

    res.status(200).json({
      success: true,
      data: updatedVariety,
    });
  } catch (error) {
    // Check for duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "A variety with this name already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error updating variety",
      error: error.message,
    });
  }
};

// Delete variety and its properties
exports.deleteVariety = async (req, res) => {
  try {
    const varietyId = req.params.id;

    // Check if ID is valid
    if (!mongoose.Types.ObjectId.isValid(varietyId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid variety ID format",
      });
    }

    // Start a session to perform a transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Delete the variety
      const deletedVariety = await Variety.findByIdAndDelete(varietyId).session(
        session
      );

      if (!deletedVariety) {
        await session.abortTransaction();
        session.endSession();

        return res.status(404).json({
          success: false,
          message: "Variety not found",
        });
      }

      // Delete all properties associated with this variety
      await Property.deleteMany({ variety: varietyId }).session(session);

      // Commit the transaction
      await session.commitTransaction();
      session.endSession();

      res.status(200).json({
        success: true,
        message: "Variety and its properties deleted successfully",
      });
    } catch (error) {
      // If an error occurred, abort the transaction
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting variety",
      error: error.message,
    });
  }
};

// Create a new property for a variety
exports.createProperty = async (req, res) => {
  try {
    const varietyId = req.body.variety;

    // Check if variety ID is valid
    if (!mongoose.Types.ObjectId.isValid(varietyId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid variety ID format",
      });
    }

    // Check if variety exists
    const variety = await Variety.findById(varietyId);
    if (!variety) {
      return res.status(404).json({
        success: false,
        message: "Variety not found",
      });
    }
    console.log(req.body);
    // Sanitize input data - don't sanitize image URLs to prevent encoding slashes
    const valueType = req.body.valueType === "image" ? "image" : "text";
    const sanitizedData = {
      variety: varietyId,
      name: sanitizeInput(req.body.name?.toLowerCase()),
      valueType: valueType,
      value:
        valueType === "image" ? req.body.value : sanitizeInput(req.body.value),
    };

    // Create new property
    const newProperty = new Property(sanitizedData);
    await newProperty.save();

    res.status(201).json({
      success: true,
      data: newProperty,
    });
  } catch (error) {
    // Check for duplicate key error (unique constraint on variety and name)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "A property with this name already exists for this variety",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error creating property",
      error: error.message,
    });
  }
};

// Get all properties for a variety
exports.getPropertiesByVariety = async (req, res) => {
  try {
    const varietyId = req.params.varietyId;

    // Check if ID is valid
    if (!mongoose.Types.ObjectId.isValid(varietyId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid variety ID format",
      });
    }

    // Check if variety exists
    const variety = await Variety.findById(varietyId);
    if (!variety) {
      return res.status(404).json({
        success: false,
        message: "Variety not found",
      });
    }

    // Find all properties for this variety
    const properties = await Property.find({ variety: varietyId }).sort({
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
    const property = await Property.findById(propertyId);
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
    const updatedProperty = await Property.findByIdAndUpdate(
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
        message: "A property with this name already exists for this variety",
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
    const deletedProperty = await Property.findByIdAndDelete(propertyId);

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

exports.getVarietiesImages = async (req, res) => {
  try {
    const varieties = await Variety.find().sort();

    if (!varieties || varieties.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No varieties found",
      });
    }

    const properties = await Property.find({
      variety: { $in: varieties.map((v) => v._id) },
      valueType: "image",
    }).select("value");

    const images = properties.map((property) => property.value);

    res.status(200).json({
      success: true,
      count: images.length,
      data: images,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving varieties",
      error: error.message,
    });
  }
};
