const express = require("express");
const router = express.Router();
const rsvpController = require("../controllers/rsvp.controller");
const authenticateToken = require("../middleware/auth");

// RSVP to an event (create OR update)
router.post("/:eventId", authenticateToken, rsvpController.rsvpToEvent);

// Get RSVP status for a specific user on a specific event
router.get("/:eventId/status/:userId", rsvpController.getRSVPStatus);

// Get attendees for an event
router.get("/:eventId/attendees", rsvpController.getAttendees);

// Delete RSVP
router.delete("/:eventId/:userId", authenticateToken, rsvpController.deleteRSVP);

module.exports = router;
