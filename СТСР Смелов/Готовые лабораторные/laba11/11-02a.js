const fs = require("fs");
const path = require("path");
const WebSocket = require("ws");

const outDir = path.join(__dirname, "downloaded");
fs.mkdirSync(outDir, { recursive: true });

const ws = new WebSocket("ws://localhost:4000");

let expectedFile = null;

ws.on("open", () => {
  console.log("Connected to 11-02 server");
  ws.send(JSON.stringify({ type: "list" }));
});

ws.on("message", (data, isBinary) => {
  if (!isBinary) {
    const msg = JSON.parse(data.toString());
    if (msg.files) {
      const first = msg.files[0];
      console.log("Files:", msg.files);
      console.log("Requesting:", first);
      ws.send(JSON.stringify({ type: "get", filename: first }));
      return;
    }
    if (msg.type === "file-meta") {
      expectedFile = msg.filename;
      return;
    }
    console.log("Server:", msg);
    return;
  }

  const name = expectedFile || `download-${Date.now()}.bin`;
  const outPath = path.join(outDir, name);
  fs.writeFileSync(outPath, data);
  console.log("Saved to:", outPath);
  ws.close();
});

ws.on("error", (e) => console.error("WS error:", e.message));
