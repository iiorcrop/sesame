const { Router } = require("express");

const {
  getOfferings,
  createOffering,
  getOfferingById,
  updateOffering,
  deleteOffering,
} = require("../controllers/offerings.controller");

const router = Router();

router.post("/", createOffering);
router.get("/", getOfferings);
router.get("/:id", getOfferingById);
router.put("/:id", updateOffering);
router.delete("/:id", deleteOffering);

module.exports = router;
