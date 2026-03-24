const express = require("express");
const router = express.Router();
const ticketmasterController = require("../controllers/ticketmaster.controller");

router.get("/", ticketmasterController.getTicketmasterEvents);

router.get("/:id", ticketmasterController.getTicketmasterEventById);

module.exports = router;
