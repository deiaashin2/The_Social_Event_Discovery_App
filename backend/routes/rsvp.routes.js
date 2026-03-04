const express = require("express");
const router = express.Router();
const pool = require("../db");

const VALID_STATUSES = ["going", "interested", "not_going"];

//Helper: count ONLY "going" RSVPs for an event
async function getGoingCount(eventId) {
  const result = await pool.query(
    `
    SELECT COUNT(*)::INT AS going_count
    FROM event_attendees
    WHERE event_id = $1
      AND status = 'going'
    `,
    [eventId]
  );

  return result.rows[0].going_count;
}

//RSVP to an event (create OR update)

router.post("/:eventId", async (req, res) => {
  const { eventId } = req.params;
  const { user_id, status } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: "user_id is required" });
  }

  const finalStatus = status || "going";

  if (!VALID_STATUSES.includes(finalStatus)) {
    return res.status(400).json({ error: "Invalid RSVP status" });
  }

  try {
    // Check event exists + capacity
    const eventResult = await pool.query(
      "SELECT capacity FROM events WHERE event_id = $1",
      [eventId]
    );

    if (eventResult.rows.length === 0) {
      return res.status(404).json({ error: "Event not found" });
    }

    const capacity = eventResult.rows[0].capacity; // null => unlimited

    // Enforce capacity ONLY if user wants to be "going"
    if (finalStatus === "going" && capacity !== null) {
      // Count current "going" attendees EXCLUDING this user
      const countResult = await pool.query(
        `
        SELECT COUNT(*)::INT AS going_count
        FROM event_attendees
        WHERE event_id = $1
          AND status = 'going'
          AND user_id <> $2
        `,
        [eventId, user_id]
      );

      const goingCountExcludingUser = countResult.rows[0].going_count;

      if (goingCountExcludingUser >= capacity) {
        return res.status(409).json({
          error: "Event is at full capacity",
          capacity,
          going_count: goingCountExcludingUser,
        });
      }
    }

    // Insert or update RSVP
    const result = await pool.query(
      `
      INSERT INTO event_attendees (event_id, user_id, status)
      VALUES ($1, $2, $3)
      ON CONFLICT (event_id, user_id)
      DO UPDATE SET status = EXCLUDED.status, joined_at = NOW()
      RETURNING event_id, user_id, status, joined_at
      `,
      [eventId, user_id, finalStatus]
    );

    const rsvp = result.rows[0];

    // Updated going count (ONLY "going")
    const goingCount = await getGoingCount(eventId);

    return res.status(201).json({
      message: "RSVP saved",
      rsvp,
      attendee_count: goingCount,
      capacity,
    });
  } catch (err) {
    console.error("Error creating RSVP:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

//Get RSVP status for a specific user on a specific event
router.get("/:eventId/status/:userId", async (req, res) => {
  const { eventId, userId } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT status
      FROM event_attendees
      WHERE event_id = $1 AND user_id = $2
      `,
      [eventId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "RSVP not found" });
    }

    return res.json({
      event_id: eventId,
      user_id: userId,
      status: result.rows[0].status,
    });
  } catch (err) {
    console.error("Error fetching RSVP status:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Get attendees for an event
router.get("/:eventId/attendees", async (req, res) => {
  const { eventId } = req.params;

  try {
    const result = await pool.query(
      "SELECT * FROM event_attendees WHERE event_id = $1",
      [eventId]
    );

    return res.json(result.rows);
  } catch (err) {
    console.error("Error fetching attendees:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Delete RSVP
router.delete("/:eventId/:userId", async (req, res) => {
  const { eventId, userId } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM event_attendees WHERE event_id = $1 AND user_id = $2 RETURNING *",
      [eventId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "RSVP not found" });
    }

    return res.status(204).send();
  } catch (err) {
    console.error("Error deleting RSVP:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;