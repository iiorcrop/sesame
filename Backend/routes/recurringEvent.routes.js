const { Router } = require("express");

const {
  createRecurringEvent,
  getRecurringEvents,
  getRecurringEventById,
  updateRecurringEvent,
  deleteRecurringEvent,
  addImageToRecurringEvent,
  removeImageFromRecurringEvent,
  getRecurringEventImagesByYear,
  searchRecurringEventsByName,
} = require("../controllers/recurringEvent.controller");

const router = Router();

// Basic CRUD routes
router.post("/", createRecurringEvent);
router.get("/", getRecurringEvents);
router.get("/search", searchRecurringEventsByName);
router.get("/:id", getRecurringEventById);
router.put("/:id", updateRecurringEvent);
router.delete("/:id", deleteRecurringEvent);

// Image management routes
router.post("/:id/images", addImageToRecurringEvent);
router.delete("/:id/images", removeImageFromRecurringEvent);
router.get("/:id/images/:year", getRecurringEventImagesByYear);

module.exports = router;
