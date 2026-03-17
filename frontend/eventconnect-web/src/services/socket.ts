import { io, Socket } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || "http://localhost:4000";

let socket: Socket | null = null;
let messageQueue: any[] = [];

export function getSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socket.on("connect", () => {
      console.log("Connected:", socket?.id);

      // Retry queued messages
      while (messageQueue.length > 0) {
        const msg = messageQueue.shift();
        socket?.emit("chat_message", msg);
      }
    });

    socket.on("disconnect", () => {
      console.warn("Disconnected from server");
    });

    socket.on("connect_error", () => {
      console.error("Connection error occurred");
    });
  }

  return socket;
}

export function sendMessageWithRetry(payload: any) {
  if (socket?.connected) {
    socket.emit("chat_message", payload);
  } else {
    console.warn("Socket not connected, queuing message");
    messageQueue.push(payload);
  }
}