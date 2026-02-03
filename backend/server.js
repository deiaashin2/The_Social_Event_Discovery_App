require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: '*', // tighten later
  },
});

io.on('connection', (socket) => {
  console.log('a user connected', socket.id);

  // Example room join
  socket.on('join_room', (roomId) => {
    socket.join(roomId);
  });

  // Example chat event
  socket.on('chat_message', ({ roomId, message }) => {
    io.to(roomId).emit('chat_message', { message, from: socket.id });
  });

  socket.on('disconnect', () => {
    console.log('user disconnected', socket.id);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Backend listening on ${PORT}`);
});
