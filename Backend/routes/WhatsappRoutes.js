const { Router } = require("express");

const WhatsappNumber = require("../models/WhatsappNumber");

const {
  UpdateWhatsappNumber,
  GetWhatsappNumber,
} = require("../controllers/WhatsappController");

const router = Router();

router.put("/:id", UpdateWhatsappNumber);

router.get("/", GetWhatsappNumber);

module.exports = router;
