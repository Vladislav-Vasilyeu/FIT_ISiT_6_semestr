const WebSocket = require("ws");

const ws = new WebSocket("ws://localhost:4000");

ws.on("open", () => console.log("11-03a connected"));
ws.on("message", (data) => console.log(data.toString()));
ws.on("close", () => console.log("11-03a disconnected"));
ws.on("error", (e) => console.error("WS error:", e.message));

