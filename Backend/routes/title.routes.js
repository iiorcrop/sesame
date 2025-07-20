const express = require("express");
const router = express.Router();
const {
  createOrUpdateTitle,
  getTitle,
  deleteTitle,
} = require("../controllers/titleController");

router.post("/title", createOrUpdateTitle);
router.get("/title", getTitle);
router.delete("/title", deleteTitle);

module.exports = router;
