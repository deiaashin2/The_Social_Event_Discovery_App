require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const pool = require('./db');          // PostgreSQL
const redisClient = require('./cache'); // Redis

const app = express();
app.use(cors());
app.use(express.json());

// Health route
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// DB TEST route
app.get('/db-test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ ok: true, time: result.rows[0].now });
  } catch (err) {
    console.error('DB test error:', err);
    res.status(500).json({ ok: false, error: 'DB connection failed' });
  }
});

// REDIS TEST route (optional)
app.get('/redis-test', async (req, res) => {
  try {
    await redisClient.set('hello', 'world');
    const value = await redisClient.get('hello');
    res.json({ ok: true, value });
  } catch (err) {
    console.error('Redis test error:', err);
    res.status(500).json({ ok: false, error: 'Redis connection failed' });
  }
});

// Socket.io setup AFTER routes
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*', 
  },
});

io.on('connection', (socket) => {
  console.log('a user connected', socket.id);

  socket.on('join_room', (roomId) => {
    socket.join(roomId);
  });

  socket.on('chat_message', ({ roomId, message }) => {
    io.to(roomId).emit('chat_message', { message, from: socket.id });
  });

  socket.on('disconnect', () => {
    console.log('user disconnected', socket.id);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
