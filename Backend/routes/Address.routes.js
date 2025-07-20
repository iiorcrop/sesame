const { Router } = require("express");
const {
  getAllAddress,
  createAddress,
  updateAddress,
  deleteAddress,
} = require("../controllers/Address.controller");

const router = Router();

router.post("/create", createAddress);
router.get("/", getAllAddress);
router.put("/:id", updateAddress);
router.delete("/:id", deleteAddress);

module.exports = router;
