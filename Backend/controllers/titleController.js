const Title = require("../models/PageTitleModel");

exports.createOrUpdateTitle = async (req, res) => {
  try {
    const { title, subtitle } = req.body;
    if (!title?.trim()) {
      return res.status(400).json({ message: "Title is required" });
    }

    let existing = await Title.findOne();
    if (existing) {
      existing.title = title.trim();
      existing.subtitle = subtitle?.trim() || "";
      await existing.save();
      return res.status(200).json({ message: "Title updated", title: existing });
    }

    const newTitle = await Title.create({ title: title.trim(), subtitle: subtitle?.trim() || "" });
    res.status(201).json({ message: "Title created", title: newTitle });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getTitle = async (req, res) => {
  try {
    const title = await Title.findOne();
    res.status(200).json({ title });
  } catch (err) {
    res.status(500).json({ message: "Error fetching title" });
  }
};

exports.deleteTitle = async (req, res) => {
  try {
    await Title.deleteMany();
    res.status(200).json({ message: "Title deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting title" });
  }
};
