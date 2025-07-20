const { Router } = require("express");

const {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventYears,
} = require("../controllers/event.controller");

const router = Router();

router.post("/", createEvent);
router.get("/years", getEventYears);
router.get("/", getEvents);
router.get("/:id", getEventById);
router.put("/:id", updateEvent);
router.delete("/:id", deleteEvent);

module.exports = router;
