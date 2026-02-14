// backend/tests/testServer.js
const path = require("path");
const { spawn } = require("child_process");

let proc; //hold backend process once started

function waitForServerReady() {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("Server did not start in time")), 12000); // test fails if the server doesn't start within 12 seconds

    proc.stdout.on("data", (data) => { // Listen for the server's startup message
      const msg = data.toString();
      if (msg.includes("Backend listening on http://localhost:")) {
        clearTimeout(timeout);
        resolve();
      }
    });

    proc.stderr.on("data", (data) => { // Log any errors from the server process
      console.error(data.toString());
    });
  });
}

async function startBackend() { // start bcakend before tests run, and wait until it's ready to accept requests
  if (proc) return;

  const serverPath = path.join(__dirname, "..", "server_with_socket.js");
  proc = spawn("node", [serverPath], {
    env: { ...process.env, PORT: "4000" },
    stdio: ["ignore", "pipe", "pipe"],
  });

  await waitForServerReady();
}

async function stopBackend() { //stop backend after tests complete
  if (!proc) return;
  proc.kill();
  proc = null;
}

module.exports = { startBackend, stopBackend }; // export the functions 
