const express = require("express");
const router = express.Router();
const rsvpController = require("../controllers/rsvp.controller");
const authenticateToken = require("../middleware/auth");

router.post("/:eventId", authenticateToken, rsvpController.rsvpToEvent);
router.get("/:eventId/status/:userId", rsvpController.getRSVPStatus);
router.get("/:eventId/attendees", rsvpController.getAttendees);
router.delete("/:eventId/:userId", authenticateToken, rsvpController.deleteRSVP);

module.exports = router;