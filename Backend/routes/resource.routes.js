const { Router } = require("express");

const {
  getResources,
  createResource,
  updateResource,
  deleteResource,
  getAvailableYears,
} = require("../controllers/resource.controller");

const router = Router();

router.get("/", getResources);
router.get("/years", getAvailableYears);
router.post("/", createResource);
router.put("/:id", updateResource);
router.delete("/:id", deleteResource);

module.exports = router;
