const WebSocket = require("ws");

const PORT = 4000;
const wss = new WebSocket.Server({ port: PORT });
console.log(`11-03 WS server started on ws://localhost:${PORT}`);

let counter = 0;

function broadcast(text) {
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) client.send(text);
  }
}

wss.on("connection", (ws) => {
  ws.isAlive = true;
  ws.on("pong", () => {
    ws.isAlive = true;
  });
  ws.on("close", () => {});
});

// Every 15 seconds: broadcast sequential message.
setInterval(() => {
  counter += 1;
  broadcast(`11-03-server: ${counter}`);
}, 15000);

// Every 5 seconds: ping clients and print alive count.
setInterval(() => {
  let aliveCount = 0;
  for (const ws of wss.clients) {
    if (ws.isAlive) aliveCount += 1;
    ws.isAlive = false;
    if (ws.readyState === WebSocket.OPEN) ws.ping();
  }
  console.log(`Alive connections: ${aliveCount}/${wss.clients.size}`);
}, 5000);

