const FlashNews = require("../models/FlashNews");

// Create flash news
const createFlashNews = async (req, res) => {
  try {
    const { news } = req.body;
    if (!news || typeof news !== "string" || !news.trim()) {
      return res.status(400).json({ error: "Flash news text is required." });
    }
    if (news.length > 200) {
      return res.status(400).json({ error: "Flash news must be at most 200 characters." });
    }
   
    const flashNews = new FlashNews({
      news: news.trim(),
    
    });
    await flashNews.save();
    res.status(201).json(flashNews);
  } catch (err) {
    res.status(500).json({ error: "Server error." ,err});
  }
};

// Fetch all flash news (latest first)
const getAllFlashNews = async (req, res) => {
  try {
    const newsList = await FlashNews.find().sort({ createdAt: -1 });
    res.json(newsList);
  } catch (err) {
    res.status(500).json({ error: "Server error." });
  }
};


 
module.exports = {
  createFlashNews,
  getAllFlashNews,
};