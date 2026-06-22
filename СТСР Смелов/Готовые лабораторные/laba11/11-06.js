const readline = require("readline");
const { Server } = require("rpc-websockets");

const PORT = 40000;
const server = new Server({ port: PORT, host: "localhost" });
console.log(`11-06 PubSub WS server started on ws://localhost:${PORT}`);
console.log("Type A / B / C in console to publish events.");

// Pre-register events for clarity.
server.event("A");
server.event("B");
server.event("C");

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
rl.on("line", (line) => {
  const v = (line || "").trim().toUpperCase();
  if (v === "A" || v === "B" || v === "C") {
    server.emit(v, { event: v, timestamp: Date.now() });
    console.log(`Emitted event ${v}`);
  } else {
    console.log("Type A, B, or C");
  }
});

