const { Router } = require("express");

const {
  getNews,
  createNews,
  getNewsById,
  updateNews,
  deleteNews,
} = require("../controllers/news.controller");

const router = Router();

router.get("/", getNews);
router.post("/", createNews);
router.get("/:id", getNewsById);
router.put("/:id", updateNews);
router.delete("/:id", deleteNews);

module.exports = router;
