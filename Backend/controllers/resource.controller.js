const ResourceModel = require("../models/ResourceModel");

exports.createResource = async (req, res) => {
  try {
    const { content, type, year } = req.body;

    if (!content || !type || !year) {
      return res
        .status(400)
        .json({ message: "Content, type, and year are required" });
    }

    const newResource = await ResourceModel.create({ content, type, year });

    res.status(201).json({
      message: "Resource created successfully",
      resource: newResource,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getResources = async (req, res) => {
  const { type, year, limit, page } = req.query;

  try {
    const query = {};
    if (type) {
      query.type = type;
    }
    if (year) {
      query.year = year;
    }

    const pageNumber = parseInt(page) || 1;
    const limitNumber = parseInt(limit) || 10;
    const skip = (pageNumber - 1) * limitNumber;

    // Get total count for pagination
    const totalResources = await ResourceModel.countDocuments(query);

    const resources = await ResourceModel.find(query)
      .limit(limitNumber)
      .skip(skip)
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Resources retrieved successfully",
      resources,
      pagination: {
        currentPage: pageNumber,
        totalPages: Math.ceil(totalResources / limitNumber),
        totalResources,
        limit: limitNumber,
        hasNextPage: pageNumber < Math.ceil(totalResources / limitNumber),
        hasPrevPage: pageNumber > 1,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateResource = async (req, res) => {
  const { id } = req.params;
  const { content, type, year } = req.body;

  try {
    const updatedResource = await ResourceModel.findByIdAndUpdate(
      id,
      { content, type, year },
      { new: true }
    );

    if (!updatedResource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    res.status(200).json({
      message: "Resource updated successfully",
      resource: updatedResource,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.deleteResource = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedResource = await ResourceModel.findByIdAndDelete(id);

    if (!deletedResource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    res.status(200).json({
      message: "Resource deleted successfully",
      resource: deletedResource,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getAvailableYears = async (req, res) => {
  try {
    const years = await ResourceModel.distinct("year");
    const validYears = years
      .filter((year) => year && typeof year === "number")
      .sort((a, b) => b - a); // Sort descending (newest first)

    res.status(200).json({
      message: "Available years retrieved successfully",
      years: validYears,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
