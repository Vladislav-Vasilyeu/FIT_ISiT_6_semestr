const WebSocket = require("ws");

const PORT = 4000;
const wss = new WebSocket.Server({ port: PORT });
console.log(`11-04 WS server started on ws://localhost:${PORT}`);

let n = 0;

wss.on("connection", (ws) => {
  ws.on("message", (data, isBinary) => {
    if (isBinary) return;

    let msg;
    try {
      msg = JSON.parse(data.toString());
    } catch {
      ws.send(JSON.stringify({ error: "Invalid JSON" }));
      return;
    }

    const x = msg.client;
    const t = msg.timestamp;
    n += 1;
    ws.send(JSON.stringify({ server: n, client: x, timestamp: t }));
  });
});

