const WebSocket = require("ws");

const PORT = 4000;
const wss = new WebSocket.Server({ port: PORT });
console.log(`11-07 WS server started on ws://localhost:${PORT}`);

wss.on("connection", (ws) => {
  ws.on("message", (data, isBinary) => {
    if (isBinary) return;
    const msg = data.toString().trim().toUpperCase();
    if (msg === "A") console.log("Notification A received");
    else if (msg === "B") console.log("Notification B received");
    else if (msg === "C") console.log("Notification C received");
    else console.log("Unknown notification:", msg);
  });
});

