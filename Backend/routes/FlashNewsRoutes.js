const express = require("express");
const router = express.Router();
const { createFlashNews, getAllFlashNews } = require("../controllers/FlashNewsController");

// POST /api/flash-news - create flash news (auth required)
router.post("/", createFlashNews);

// GET /api/flash-news - fetch all flash news
router.get("/", getAllFlashNews);

module.exports = router;
