const express = require("express");
const router = express.Router();
const attendeesController = require("../controllers/attendees.controller");

router.get("/:eventId/attendees", attendeesController.getEventAttendees);

module.exports = router;
