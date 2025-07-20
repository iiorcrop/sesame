const {
  sanitizeInput,
  isValidUrl,
  normalizePhone,
  stripInvisibleChars,
} = require("../utils/sanitizeInput");

module.exports = (req, res, next) => {
  try {
    const { action, data = {} } = req.body;

    if (!action || typeof action !== "string") {
      return res.status(400).json({ message: "Invalid action" });
    }

    if (["create", "update"].includes(action)) {
      let { platform, icon, value } = data;

      platform = stripInvisibleChars(sanitizeInput(platform));
      icon = stripInvisibleChars(sanitizeInput(icon));
      value = stripInvisibleChars(value?.trim() || "");

      if (!platform || !icon) {
        return res
          .status(400)
          .json({ message: "Platform and icon are required" });
      }

      if (icon === "WhatsApp") {
        const phone = normalizePhone(value);
        if (!/^[6-9]\d{9}$/.test(phone)) {
          return res
            .status(400)
            .json({ message: "Invalid Indian mobile number" });
        }
        if (!phone.startsWith("91")) {
          data.value = `+91${phone}`;
        }
      } else {
        if (value && !isValidUrl(value)) {
          return res.status(400).json({ message: "Invalid URL" });
        }
        data.value = value;
      }

      data.platform = platform;
      data.icon = icon;
      req.body.data = data;
    }

    next();
  } catch (err) {
    console.error("[validateSocialMedia] Error:", err);
    return res.status(500).json({ message: "Validation failed" });
  }
};
