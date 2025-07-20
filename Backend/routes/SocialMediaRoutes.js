const { Router } = require("express");
const router = Router();
const express = require("express");

const {
  socialMediaActionHandler,
} = require("../controllers/SocialMediaController");

const validateSocialMedia = require("../middleware/validateSocialMedia");
const { normalizeParams } = require("../middleware/normalizeParams");
const rateLimiter = require("../middleware/rateLimiter");

router.post(
  "/create-social-media",
  rateLimiter,
  normalizeParams,
  validateSocialMedia,
  socialMediaActionHandler
);

module.exports = router;
