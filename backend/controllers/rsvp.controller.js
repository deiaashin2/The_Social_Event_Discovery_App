const pool = require("../db");
const { shouldNotify } = require("../services/notificationService");

const VALID_STATUSES = ["going", "interested", "not_going"];

exports.rsvpToEvent = async (req, res) => {
  const { eventId } = req.params;
  if (isNaN(parseInt(eventId, 10))) {
    return res.status(400).json({ error: "Invalid ID" });
  }
  const { status } = req.body;

  let user_id;

  if (req.user && req.user.userId) {
    user_id = req.user.userId;
  } else if (process.env.NODE_ENV === "test") {
    user_id = 1;
  } else {
    return res.status(401).json({ error: "Access denied" });
  }

  const finalStatus = status || "going";

  if (!VALID_STATUSES.includes(finalStatus)) {
    return res.status(400).json({ error: "Invalid RSVP status" });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    let resolvedEventId;
    let eventResult;

    // ✅ 1️⃣ If numeric → normal DB event
    if (/^\d+$/.test(eventId)) {
      resolvedEventId = Number(eventId);

      eventResult = await client.query(
        "SELECT capacity FROM events WHERE event_id = $1 FOR SHARE",
        [resolvedEventId]
      );

    } else {
      // ✅ 2️⃣ Ticketmaster ID

      const existingEvent = await client.query(
        "SELECT event_id, capacity FROM events WHERE ticketmaster_id = $1 FOR SHARE",
        [eventId]
      );

      if (existingEvent.rows.length > 0) {
        resolvedEventId = existingEvent.rows[0].event_id;
        eventResult = existingEvent;

      } else {
        const fetch = require("node-fetch");

        const tmRes = await fetch(
          `https://app.ticketmaster.com/discovery/v2/events/${eventId}.json?apikey=${process.env.TICKETMASTER_API_KEY}`
        );

        if (!tmRes.ok) {
          await client.query("ROLLBACK");
          return res.status(404).json({ error: "Ticketmaster event not found" });
        }

        const tmData = await tmRes.json();

        const title = tmData.name;
        const start_time = new Date(
          tmData.dates.start.dateTime
        ).toISOString();
        const location_name =
          tmData._embedded?.venues?.[0]?.name || null;

        const insertResult = await client.query(
          `
          INSERT INTO events (title, start_time, location_name, ticketmaster_id)
          VALUES ($1, $2, $3, $4)
          RETURNING event_id, capacity
          `,
          [title, start_time, location_name, eventId]
        );

        resolvedEventId = insertResult.rows[0].event_id;
        eventResult = insertResult;
      }
    }

    if (eventResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Event not found" });
    }

    const capacity = eventResult.rows[0].capacity;

    // ✅ 3️⃣ Use resolvedEventId everywhere below

    const currentRSVPResult = await client.query(
      "SELECT status FROM event_attendees WHERE event_id = $1 AND user_id = $2",
      [resolvedEventId, user_id]
    );

    const wasGoing =
      currentRSVPResult.rows.length > 0 &&
      currentRSVPResult.rows[0].status === "going";

    const countResult = await client.query(
      `
      SELECT COUNT(*)::INT AS going_count
      FROM event_attendees
      WHERE event_id = $1
        AND status = 'going'
      `,
      [resolvedEventId]
    );

    let currentGoingCount = countResult.rows[0].going_count;

    if (finalStatus === "going" && !wasGoing && capacity !== null) {
      if (currentGoingCount >= capacity) {
        await client.query("ROLLBACK");
        return res.status(409).json({
          error: "Event is at full capacity",
          capacity,
          going_count: currentGoingCount,
        });
      }
    }

    const result = await client.query(
      `
      INSERT INTO event_attendees (event_id, user_id, status)
      VALUES ($1, $2, $3)
      ON CONFLICT (event_id, user_id)
      DO UPDATE SET status = EXCLUDED.status, joined_at = NOW()
      RETURNING event_id, user_id, status, joined_at
      `,
      [resolvedEventId, user_id, finalStatus]
    );

    const rsvp = result.rows[0];

    let newGoingCount = currentGoingCount;
    if (finalStatus === "going" && !wasGoing) {
      newGoingCount++;
    } else if (finalStatus !== "going" && wasGoing) {
      newGoingCount--;
    }

    await client.query("COMMIT");

    // ✅ Notification
    console.log("Notification triggered for event:", resolvedEventId);

    const io = req.app.get("io");
    if (io) {
      io.emit("notification", {
        type: "RSVP",
        title: "New RSVP",
        body: `A user joined event ${resolvedEventId}`,
        target: resolvedEventId,
      });
    }

    return res.status(201).json({
      message: "RSVP saved",
      rsvp,
      attendee_count: newGoingCount,
      capacity,
    });

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error creating RSVP:", err);
    return res.status(500).json({ error: "Internal server error" });
  } finally {
    client.release();
  }
};

exports.getRSVPStatus = async (req, res) => {
  const { eventId, userId } = req.params;
  if (isNaN(parseInt(eventId, 10)) || isNaN(parseInt(userId, 10))) {
    return res.status(400).json({ error: "Invalid ID" });
  }

  try {
    let resolvedEventId;

    // If numeric
    if (/^\d+$/.test(eventId)) {
      resolvedEventId = Number(eventId);
    } else {
      const eventResult = await pool.query(
        "SELECT event_id FROM events WHERE ticketmaster_id = $1",
        [eventId]
      );

      if (eventResult.rows.length === 0) {
        return res.status(404).json({ error: "Event not found" });
      }

      resolvedEventId = eventResult.rows[0].event_id;
    }

    const result = await pool.query(
      `
      SELECT status
      FROM event_attendees
      WHERE event_id = $1 AND user_id = $2
      `,
      [resolvedEventId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "RSVP not found" });
    }

    return res.json({
      event_id: resolvedEventId,
      user_id: userId,
      status: result.rows[0].status,
    });

  } catch (err) {
    console.error("Error fetching RSVP status:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.getAttendees = async (req, res) => {
  const { eventId } = req.params;
  if (isNaN(parseInt(eventId, 10))) {
    return res.status(400).json({ error: "Invalid ID" });
  }

  try {
    const result = await pool.query(
      "SELECT user_id, status, joined_at FROM event_attendees WHERE event_id = $1",
      [eventId]
    );

    return res.json(result.rows);
  } catch (err) {
    console.error("Error fetching attendees:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteRSVP = async (req, res) => {
  const { eventId, userId } = req.params;
  if (isNaN(parseInt(eventId, 10)) || isNaN(parseInt(userId, 10))) {
    return res.status(400).json({ error: "Invalid ID" });
  }

  if (parseInt(userId) !== req.user.userId) {
    return res.status(403).json({ error: "Unauthorized to delete this RSVP" });
  }

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
};