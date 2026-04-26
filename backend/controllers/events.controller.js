const pool = require("../db");

exports.getAllEvents = async (req, res) => {
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
};

exports.getEventById = async (req, res) => {
  const { id } = req.params;

  try {
    let resolvedEventId;
    let result;

    if (/^\d+$/.test(id)) {
      resolvedEventId = Number(id);

      result = await pool.query(`
        SELECT e.*, COUNT(ea.user_id)::INT AS rsvp_count
        FROM events e
        LEFT JOIN event_attendees ea 
          ON e.event_id = ea.event_id 
          AND ea.status = 'going'
        WHERE e.event_id = $1
        GROUP BY e.event_id
      `, [resolvedEventId]);

    } else {
      // Try existing Ticketmaster record
      const existing = await pool.query(
        "SELECT event_id FROM events WHERE ticketmaster_id = $1",
        [id]
      );

      if (existing.rows.length > 0) {
        resolvedEventId = existing.rows[0].event_id;

        result = await pool.query(`
          SELECT e.*, COUNT(ea.user_id)::INT AS rsvp_count
          FROM events e
          LEFT JOIN event_attendees ea 
            ON e.event_id = ea.event_id 
            AND ea.status = 'going'
          WHERE e.event_id = $1
          GROUP BY e.event_id
        `, [resolvedEventId]);

      } else {
        // Fetch from Ticketmaster and insert immediately

        const fetch = require("node-fetch");

        const tmRes = await fetch(
          `https://app.ticketmaster.com/discovery/v2/events/${id}.json?apikey=${process.env.TICKETMASTER_API_KEY}`
        );

        if (!tmRes.ok) {
          return res.status(404).json({ error: "Ticketmaster event not found" });
        }

        const tmData = await tmRes.json();

        const title = tmData.name;

        let start_time = null;

        if (tmData.dates?.start?.dateTime) {
          start_time = new Date(
            tmData.dates.start.dateTime
          ).toISOString();
        } else if (tmData.dates?.start?.localDate) {
          start_time = new Date(
            tmData.dates.start.localDate
          ).toISOString();
        }

        const location_name =
        tmData._embedded?.venues?.[0]?.name || null;

        const insert = await pool.query(
          `
          INSERT INTO events (title, start_time, location_name, ticketmaster_id)
          VALUES ($1, $2, $3, $4)
          RETURNING event_id
          `,
          [title, start_time, location_name, id]
        );

        resolvedEventId = insert.rows[0].event_id;

        result = await pool.query(`
          SELECT e.*, COUNT(ea.user_id)::INT AS rsvp_count
          FROM events e
          LEFT JOIN event_attendees ea 
            ON e.event_id = ea.event_id 
            AND ea.status = 'going'
          WHERE e.event_id = $1
          GROUP BY e.event_id
        `, [resolvedEventId]);
      }
    }

    if (!result.rows.length) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.json(result.rows[0]);

  } catch (err) {
    console.error(`Error fetching event with ID ${id}:`, err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.createEvent = async (req, res) => {
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
};

exports.updateEvent = async (req, res) => {
  const { id } = req.params;
  const { title, description, start_time, end_time, location_name } = req.body;

  if (!title || !start_time) {
    return res.status(400).json({ error: "title and start_time are required" });
  }

  try {
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

    values.push(id);
    const idParamIndex = paramIndex++;
    values.push(req.user.userId);
    const userParamIndex = paramIndex++;

    const query = `UPDATE events SET ${fields.join(", ")}, updated_at = NOW() WHERE event_id = $${idParamIndex} AND created_by = $${userParamIndex} RETURNING *`;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Event not found or unauthorized" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(`Error updating event with ID ${id}:`, err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteEvent = async (req, res) => {
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
};
