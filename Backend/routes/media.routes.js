const { Router } = require("express");

const {
  getMediaById,
  createMedia,
  updateMedia,
  deleteMedia,
  getMedia,
} = require("../controllers/media.controller");

const router = Router();

router.get("/", getMedia);
router.get("/:id", getMediaById);
router.post("/", createMedia);
router.put("/:id", updateMedia);
router.delete("/:id", deleteMedia);

module.exports = router;
