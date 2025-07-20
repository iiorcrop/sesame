const EventModel = require("../models/Event");

exports.createEvent = async (req, res) => {
  try {
    const { title, description, date, images } = req.body;

    if (!title || !description) {
      return res
        .status(400)
        .json({ message: "Title and description are required fields" });
    }

    const newEvent = await EventModel.create({
      title,
      description,
      date: date || new Date(),
      images,
    });

    res
      .status(201)
      .json({ message: "Event created successfully", event: newEvent });
  } catch (error) {
    console.error("Error creating event:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.getEvents = async (req, res) => {
  try {
    const { page = 1, limit = 10, year } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build query object
    let query = {};

    // Add year filter if provided
    if (year) {
      const startOfYear = new Date(year, 0, 1);
      const endOfYear = new Date(year, 11, 31, 23, 59, 59);
      query.date = {
        $gte: startOfYear,
        $lte: endOfYear,
      };
    }

    // Get total count for pagination
    const totalEvents = await EventModel.countDocuments(query);

    // Get events with pagination
    const events = await EventModel.find(query)
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      events,
      length: totalEvents,
      currentPage: pageNum,
      totalPages: Math.ceil(totalEvents / limitNum),
      hasNextPage: pageNum < Math.ceil(totalEvents / limitNum),
      hasPrevPage: pageNum > 1,
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await EventModel.findById(id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json({ event });
  } catch (error) {
    console.error("Error fetching event by ID:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, date, images } = req.body;

    const updatedEvent = await EventModel.findByIdAndUpdate(
      id,
      { title, description, date, images },
      { new: true }
    );

    if (!updatedEvent) {
      return res.status(404).json({ message: "Event not found" });
    }

    res
      .status(200)
      .json({ message: "Event updated successfully", event: updatedEvent });
  } catch (error) {
    console.error("Error updating event:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedEvent = await EventModel.findByIdAndDelete(id);

    if (!deletedEvent) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.getEventYears = async (req, res) => {
  try {
    const years = await EventModel.aggregate([
      {
        $group: {
          _id: { $year: "$date" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: -1 },
      },
      {
        $project: {
          year: "$_id",
          count: 1,
          _id: 0,
        },
      },
    ]);

    const yearsList = years.map((item) => item.year);

    res.status(200).json({
      years: yearsList,
      yearsWithCount: years,
    });
  } catch (error) {
    console.error("Error fetching event years:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
