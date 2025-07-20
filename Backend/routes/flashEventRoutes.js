const express = require("express");
const router = express.Router();
const FlashEvent = require("../models/FlashEvent");

// Post request to create new pest data
router.post("/", async (req, res) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ message: "Image URL is required" });
    }

    // Create a new pest event
    const newEvent = new FlashEvent({
      imageUrl: imageUrl,
    });

    // Save the new pest event to the database
    await newEvent.save();

    return res.status(201).json({
      message: "Pest data created successfully",
    });
  } catch (error) {
    console.error("Error creating pest data:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/", async (req, res) => {
  try {
    // Fetch all pest events from the database
    const events = await FlashEvent.find();

    if (events.length === 0) {
      return res.status(404).json({ message: "No pest data found" });
    }

    return res.status(200).json(events);
  } catch (error) {
    console.error("Error fetching pest data:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ message: "Image URL is required" });
    }

    // Update the pest event with the given ID
    const updatedEvent = await FlashEvent.findByIdAndUpdate(
      id,
      { imageUrl: imageUrl },
      { new: true }
    );

    if (!updatedEvent) {
      return res.status(404).json({ message: "Pest data not found" });
    }

    return res.status(200).json({
      message: "Pest data updated successfully",
      event: updatedEvent,
    });
  } catch (error) {
    console.error("Error updating pest data:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Delete the pest event with the given ID
    const deletedEvent = await FlashEvent.findByIdAndDelete(id);

    if (!deletedEvent) {
      return res.status(404).json({ message: "Pest data not found" });
    }

    return res.status(200).json({
      message: "Pest data deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting pest data:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
