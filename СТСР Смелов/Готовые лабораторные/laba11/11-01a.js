const fs = require("fs");
const path = require("path");
const WebSocket = require("ws");

const filePath = process.argv[2] || path.join(__dirname, "client-file.txt");
if (!fs.existsSync(filePath)) {
  fs.writeFileSync(filePath, `Generated at ${new Date().toISOString()}\n`, "utf8");
}

const ws = new WebSocket("ws://localhost:4000");

ws.on("open", () => {
  console.log("Connected to 11-01 server");
  ws.send(JSON.stringify({ type: "file-meta", filename: path.basename(filePath) }));
  const buf = fs.readFileSync(filePath);
  ws.send(buf);
});

ws.on("message", (data) => {
  console.log("Server:", data.toString());
  ws.close();
});

ws.on("error", (e) => console.error("WS error:", e.message));
