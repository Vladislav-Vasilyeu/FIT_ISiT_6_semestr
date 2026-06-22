const WebSocket = require("ws");

const clientName = process.argv[2] || "client";
const ws = new WebSocket("ws://localhost:4000");

ws.on("open", () => {
  const msg = { client: clientName, timestamp: Date.now() };
  ws.send(JSON.stringify(msg));
});

ws.on("message", (data) => {
  console.log("Reply:", data.toString());
  ws.close();
});

ws.on("error", (e) => console.error("WS error:", e.message));

