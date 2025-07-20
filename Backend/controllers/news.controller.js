const NewsModel = require("../models/NewsModel");

exports.getNews = async (req, res) => {
  try {
    const news = await NewsModel.find().sort({ createdAt: -1 });
    res.status(200).json({ news });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createNews = async (req, res) => {
  try {
    const { title, description, date, expiresOn } = req.body;

    if (!title || !date) {
      return res.status(400).json({ error: "title and date are required." });
    }

    const news = await NewsModel.create({
      title,
      description,
      date,
      expiresOn,
    });

    res.status(201).json({ news });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getNewsById = async (req, res) => {
  try {
    const { id } = req.params;

    const news = await NewsModel.findById(id);

    if (!news) {
      return res.status(404).json({ error: "News not found." });
    }

    res.status(200).json({ news });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateNews = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, date, expiresOn } = req.body;

    const news = await NewsModel.findByIdAndUpdate(
      id,
      { title, description, date, expiresOn },
      { new: true }
    );

    if (!news) {
      return res.status(404).json({ error: "News not found." });
    }

    res.status(200).json({ news });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteNews = async (req, res) => {
  try {
    const { id } = req.params;

    const news = await NewsModel.findByIdAndDelete(id);

    if (!news) {
      return res.status(404).json({ error: "News not found." });
    }

    res.status(200).json({ message: "News deleted successfully." });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
