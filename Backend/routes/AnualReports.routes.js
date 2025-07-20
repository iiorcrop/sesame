const { Router } = require("express");
const {
  createAnualReport,
  getAnualReports,
  updateAnualReport,
  deleteAnualReport,
} = require("../controllers/anualReports.controller");

const router = Router();

router.post("/", createAnualReport);
router.get("/", getAnualReports);
router.put("/:id", updateAnualReport);
router.delete("/:id", deleteAnualReport);

module.exports = router;
