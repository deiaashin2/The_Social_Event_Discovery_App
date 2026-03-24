const express = require("express");
const router = express.Router();
const eventsController = require("../controllers/events.controller");
const authenticateToken = require("../middleware/auth");

// Get all events
router.get("/", eventsController.getAllEvents);

// Get a single event by ID
router.get("/:id", eventsController.getEventById);

// Create a new event
router.post("/", authenticateToken, eventsController.createEvent);

// Update an event by ID
router.put("/:id", authenticateToken, eventsController.updateEvent);

// Delete an event by ID
router.delete("/:id", authenticateToken, eventsController.deleteEvent);

module.exports = router;
