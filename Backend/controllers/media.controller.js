const MediaModel = require("../models/MediaModel");

exports.createMedia = async (req, res) => {
  try {
    const { title, type, content } = req.body;

    if (!title || !type || !content) {
      return res
        .status(400)
        .json({ error: "Title, type, and content are required." });
    }

    // Validate type
    const validTypes = ["press", "video"];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: "Invalid media type." });
    }

    const media = await MediaModel.create({ title, type, content });

    res.status(201).json({ media });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getMedia = async (req, res) => {
  try {
    const { type } = req.query;
    const filters = {};

    if (type) {
      filters.type = type;
    }

    const media = await MediaModel.find(filters).sort({ createdAt: -1 });

    res.status(200).json({ media });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getMediaById = async (req, res) => {
  try {
    const { id } = req.params;

    const media = await MediaModel.findById(id);

    if (!media) {
      return res.status(404).json({ error: "Media not found." });
    }

    res.status(200).json({ media });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateMedia = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, type, content } = req.body;

    const media = await MediaModel.findById(id);

    if (!media) {
      return res.status(404).json({ error: "Media not found." });
    }

    const updateData = {};
    if (title) updateData.title = title;
    if (type) {
      const validTypes = ["press", "video"];
      if (!validTypes.includes(type)) {
        return res.status(400).json({ error: "Invalid media type." });
      }
      updateData.type = type;
    }
    if (content) updateData.content = content;

    const updatedMedia = await MediaModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    res.status(200).json({ media: updatedMedia });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteMedia = async (req, res) => {
  try {
    const { id } = req.params;

    const media = await MediaModel.findById(id);

    if (!media) {
      return res.status(404).json({ error: "Media not found." });
    }

    await MediaModel.findByIdAndDelete(id);

    res.status(200).json({ message: "Media deleted successfully." });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
