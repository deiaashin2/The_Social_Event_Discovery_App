const http = require("http");
const { Server } = require("socket.io");
const app = require("./server_app");

const PORT = process.env.PORT || 4000;

// Create HTTP server from Express app
const httpServer = http.createServer(app);

// Attach Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Minimal socket events to satisfy your test
io.on("connection", (socket) => {
  socket.on("join_room", (roomId) => {
    socket.join(roomId);
  });

  socket.on("chat_message", ({ roomId, message }) => {
    io.to(roomId).emit("chat_message", { roomId, message });
  });
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
