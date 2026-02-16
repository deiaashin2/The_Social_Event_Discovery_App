const express = require("express");
const router = express.Router();
const pool = require("../db");

// Get all events
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM events");
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
    const result = await pool.query("SELECT * FROM events WHERE id = $1", [id]);
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
router.post("/", async (req, res) => {
  const { name, description, date, location } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO events (name, description, date, location) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, description, date, location]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating event:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update an event by ID
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, description, date, location } = req.body;
  try {
    const result = await pool.query(
      "UPDATE events SET name = $1, description = $2, date = $3, location = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *",
      [name, description, date, location, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Event not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(`Error updating event with ID ${id}:`, err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete an event by ID
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM events WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Event not found" });
    }
    res.status(204).send(); // No content for successful deletion
  } catch (err) {
    console.error(`Error deleting event with ID ${id}:`, err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
