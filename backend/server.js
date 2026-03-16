const http = require("http");
const { Server } = require("socket.io");
const app = require("./server_app");

const PORT = process.env.PORT || 4000;

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("join_room", (roomId) => {
    socket.join(roomId);
  });

  socket.on("chat_message", ({ roomId, message }) => {
    io.to(roomId).emit("chat_message", { roomId, message });
  });
});

httpServer.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});