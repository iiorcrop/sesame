const RecurringEventModel = require("../models/RecurringEventModel");

// Create a new recurring event
exports.createRecurringEvent = async (req, res) => {
  try {
    const { name, images } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    // Validate images array if provided
    if (images && Array.isArray(images)) {
      for (const image of images) {
        if (!image.year || !image.url) {
          return res
            .status(400)
            .json({ message: "Each image must have both year and url" });
        }
      }
    }

    const newRecurringEvent = await RecurringEventModel.create({
      name,
      images: images || [],
    });

    res.status(201).json({
      message: "Recurring event created successfully",
      recurringEvent: newRecurringEvent,
    });
  } catch (error) {
    console.error("Error creating recurring event:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Get all recurring events
exports.getRecurringEvents = async (req, res) => {
  try {
    const recurringEvents = await RecurringEventModel.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      recurringEvents,
      length: recurringEvents.length,
    });
  } catch (error) {
    console.error("Error fetching recurring events:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Get recurring event by ID
exports.getRecurringEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const recurringEvent = await RecurringEventModel.findById(id);

    if (!recurringEvent) {
      return res.status(404).json({ message: "Recurring event not found" });
    }

    res.status(200).json({ recurringEvent });
  } catch (error) {
    console.error("Error fetching recurring event by ID:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Update recurring event
exports.updateRecurringEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, images } = req.body;

    // Validate images array if provided
    if (images && Array.isArray(images)) {
      for (const image of images) {
        if (!image.year || !image.url) {
          return res
            .status(400)
            .json({ message: "Each image must have both year and url" });
        }
      }
    }

    const updatedRecurringEvent = await RecurringEventModel.findByIdAndUpdate(
      id,
      { name, images },
      { new: true }
    );

    if (!updatedRecurringEvent) {
      return res.status(404).json({ message: "Recurring event not found" });
    }

    res.status(200).json({
      message: "Recurring event updated successfully",
      recurringEvent: updatedRecurringEvent,
    });
  } catch (error) {
    console.error("Error updating recurring event:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Delete recurring event
exports.deleteRecurringEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedRecurringEvent = await RecurringEventModel.findByIdAndDelete(
      id
    );

    if (!deletedRecurringEvent) {
      return res.status(404).json({ message: "Recurring event not found" });
    }

    res.status(200).json({ message: "Recurring event deleted successfully" });
  } catch (error) {
    console.error("Error deleting recurring event:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Add image to recurring event
exports.addImageToRecurringEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { year, url } = req.body;

    if (!year || !url) {
      return res.status(400).json({ message: "Year and URL are required" });
    }

    const recurringEvent = await RecurringEventModel.findById(id);

    if (!recurringEvent) {
      return res.status(404).json({ message: "Recurring event not found" });
    }

    // Check if image for this year already exists
    // const existingImageIndex = recurringEvent.images.findIndex(
    //   (img) => img.year === year
    // );

    // if (existingImageIndex !== -1) {
    //   // Update existing image for the year
    //   recurringEvent.images[existingImageIndex].url = url;
    // } else {
    // Add new image
    recurringEvent.images.push({ year, url });

    await recurringEvent.save();

    res.status(200).json({
      message: "Image added/updated successfully",
      recurringEvent,
    });
  } catch (error) {
    console.error("Error adding image to recurring event:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Remove image from recurring event
exports.removeImageFromRecurringEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { year } = req.body;

    if (!year) {
      return res.status(400).json({ message: "Year is required" });
    }

    const recurringEvent = await RecurringEventModel.findById(id);

    if (!recurringEvent) {
      return res.status(404).json({ message: "Recurring event not found" });
    }

    // Remove image for the specified year
    recurringEvent.images = recurringEvent.images.filter(
      (img) => img.year !== year
    );

    await recurringEvent.save();

    res.status(200).json({
      message: "Image removed successfully",
      recurringEvent,
    });
  } catch (error) {
    console.error("Error removing image from recurring event:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Get recurring event images by year
exports.getRecurringEventImagesByYear = async (req, res) => {
  try {
    const { id, year } = req.params;

    const recurringEvent = await RecurringEventModel.findById(id);

    if (!recurringEvent) {
      return res.status(404).json({ message: "Recurring event not found" });
    }

    const imageForYear = recurringEvent.images.find((img) => img.year === year);

    if (!imageForYear) {
      return res
        .status(404)
        .json({ message: `No image found for year ${year}` });
    }

    res.status(200).json({
      eventName: recurringEvent.name,
      year: imageForYear.year,
      image: imageForYear,
    });
  } catch (error) {
    console.error("Error fetching recurring event images by year:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Search recurring events by name
exports.searchRecurringEventsByName = async (req, res) => {
  try {
    const { name } = req.query;

    if (!name) {
      return res
        .status(400)
        .json({ message: "Name query parameter is required" });
    }

    const recurringEvents = await RecurringEventModel.find({
      name: { $regex: name, $options: "i" },
    }).sort({ createdAt: -1 });

    res.status(200).json({
      recurringEvents,
      length: recurringEvents.length,
    });
  } catch (error) {
    console.error("Error searching recurring events:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
