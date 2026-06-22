const readline = require("readline");
const WebSocket = require("ws");

const ws = new WebSocket("ws://localhost:4000");

ws.on("open", () => {
  console.log("Connected to 11-07 server");
  console.log("Type A / B / C to send notifications");
});

ws.on("error", (e) => console.error("WS error:", e.message));

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
rl.on("line", (line) => {
  const v = (line || "").trim().toUpperCase();
  if (v === "A" || v === "B" || v === "C") ws.send(v);
  else console.log("Type A, B, or C");
});

