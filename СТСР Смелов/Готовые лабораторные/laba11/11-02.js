const fs = require("fs");
const path = require("path");
const WebSocket = require("ws");

const PORT = 4000;
const downloadDir = path.join(__dirname, "download");
fs.mkdirSync(downloadDir, { recursive: true });

// Ensure there is at least one file to download.
const demoFile = path.join(downloadDir, "demo.txt");
if (!fs.existsSync(demoFile)) {
  fs.writeFileSync(demoFile, `demo file generated at ${new Date().toISOString()}\n`, "utf8");
}

const wss = new WebSocket.Server({ port: PORT });
console.log(`11-02 WS server started on ws://localhost:${PORT}`);

function listFiles() {
  return fs
    .readdirSync(downloadDir, { withFileTypes: true })
    .filter((d) => d.isFile())
    .map((d) => d.name);
}

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", (data, isBinary) => {
    if (isBinary) return;
    let msg;
    try {
      msg = JSON.parse(data.toString());
    } catch {
      ws.send(JSON.stringify({ ok: false, error: "Invalid JSON" }));
      return;
    }

    if (msg.type === "list") {
      ws.send(JSON.stringify({ ok: true, files: listFiles() }));
      return;
    }

    if (msg.type === "get" && msg.filename) {
      const safeName = path.basename(msg.filename);
      const fullPath = path.join(downloadDir, safeName);
      if (!fs.existsSync(fullPath)) {
        ws.send(JSON.stringify({ ok: false, error: "File not found" }));
        return;
      }
      ws.send(JSON.stringify({ type: "file-meta", filename: safeName }));
      ws.send(fs.readFileSync(fullPath));
      return;
    }

    ws.send(JSON.stringify({ ok: false, error: "Unknown command" }));
  });

  ws.on("close", () => console.log("Client disconnected"));
});

