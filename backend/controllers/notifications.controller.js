const pool = require("../config/db");

exports.getAllNotifications = async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      `
      SELECT n.*, e.title AS event_title, e.location_name
      FROM notifications n
      LEFT JOIN events e ON n.event_id = e.event_id
      WHERE n.user_id = $1
      ORDER BY n.created_at DESC
      `,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.markNotificationAsRead = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `
      UPDATE notifications
      SET is_read = TRUE
      WHERE notification_id = $1 AND user_id = $2
      RETURNING *
      `,
      [id, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Notification not found or unauthorized" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(`Error updating notification with ID ${id}:`, err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.markAllNotificationsAsRead = async (req, res) => {
  try {
    await pool.query(
      `
      UPDATE notifications
      SET is_read = TRUE
      WHERE user_id = $1
      `,
      [req.user.userId]
    );

    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    console.error("Error updating notifications:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};