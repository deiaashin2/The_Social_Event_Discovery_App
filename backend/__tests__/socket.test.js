//verify Socket.Io client can connect to backend, join a room, and receive chat messages
const ioClient = require("socket.io-client");
const { startBackend, stopBackend } = require("./testServer");

const URL = "http://localhost:4000";

beforeAll(async () => {
  await startBackend();
});

afterAll(async () => {
  await stopBackend();
});

test("Socket connects, joins room, and receives chat_message", async () => { // this test verifies that the Socket.IO client can connect, join and receive messages sent to that room.
  const roomId = "test-room";
  const testMessage = "hello from test";

  const socket = ioClient(URL, { //create socekt client
    transports: ["websocket"],
    forceNew: true,
  });

  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("Socket connect timeout")), 8000);
    socket.on("connect", () => {
      clearTimeout(timeout);
      resolve();
    });
  });

  socket.emit("join_room", roomId); // join the room

  const received = await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("Did not receive chat_message")), 8000);

    socket.on("chat_message", (payload) => {
      if (payload?.message === testMessage) {
        clearTimeout(timeout);
        resolve(payload);
      }
    });

    socket.emit("chat_message", { roomId, message: testMessage }); //send messages and waite for broadcast 
  });

  expect(received).toHaveProperty("message", testMessage);
  socket.disconnect();
});
