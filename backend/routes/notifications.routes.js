const express = require("express");
const router = express.Router();
const notificationsController = require("../controllers/notifications.controller");
const authenticateToken = require("../middleware/auth");

// Get all notifications for logged-in user
router.get("/", authenticateToken, notificationsController.getAllNotifications);

// Mark one notification as read
router.patch("/:id/read", authenticateToken, notificationsController.markNotificationAsRead);

// Mark all notifications as read
router.patch("/read-all", authenticateToken, notificationsController.markAllNotificationsAsRead);

module.exports = router;