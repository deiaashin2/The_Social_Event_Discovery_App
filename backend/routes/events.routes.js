const express = require("express");
const router = express.Router();
const pool = require("../db");
const authenticateToken = require("../middleware/auth");

// Get all events
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT e.*, COUNT(ea.user_id)::INT AS rsvp_count
      FROM events e
      LEFT JOIN event_attendees ea ON e.event_id = ea.event_id AND ea.status = 'going'
      GROUP BY e.event_id
      ORDER BY e.start_time ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching events:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get a single event by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`
      SELECT e.*, COUNT(ea.user_id)::INT AS rsvp_count
      FROM events e
      LEFT JOIN event_attendees ea ON e.event_id = ea.event_id AND ea.status = 'going'
      WHERE e.event_id = $1
      GROUP BY e.event_id
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Event not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(`Error fetching event with ID ${id}:`, err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create a new event
router.post("/", authenticateToken, async (req, res) => {
  const { 
    title, 
    description = null, 
    start_time, 
    end_time = null, 
    location_name = null 
  } = req.body;
  
  const created_by = req.user.userId;

  if (!title || !start_time) {
    return res.status(400).json({ error: "title and start_time are required" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO events (title, description, start_time, end_time, location_name, created_by) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [title, description, start_time, end_time, location_name, created_by]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating event:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update an event by ID
router.put("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { title, description, start_time, end_time, location_name } = req.body;

  if (!title || !start_time) {
    return res.status(400).json({ error: "title and start_time are required" });
  }

  try {
    // Build dynamic query
    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (title !== undefined) {
      fields.push(`title = $${paramIndex++}`);
      values.push(title);
    }
    if (description !== undefined) {
      fields.push(`description = $${paramIndex++}`);
      values.push(description);
    }
    if (start_time !== undefined) {
      fields.push(`start_time = $${paramIndex++}`);
      values.push(start_time);
    }
    if (end_time !== undefined) {
      fields.push(`end_time = $${paramIndex++}`);
      values.push(end_time);
    }
    if (location_name !== undefined) {
      fields.push(`location_name = $${paramIndex++}`);
      values.push(location_name);
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);
    const query = `UPDATE events SET ${fields.join(", ")} WHERE event_id = $${paramIndex} AND created_by = $${paramIndex + 1} RETURNING *`;
    values.push(req.user.userId);

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Event not found or unauthorized" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(`Error updating event with ID ${id}:`, err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete an event by ID
router.delete("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM events WHERE event_id = $1 AND created_by = $2 RETURNING *", [id, req.user.userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Event not found or unauthorized" });
    }
    res.status(204).send();
  } catch (err) {
    console.error(`Error deleting event with ID ${id}:`, err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
