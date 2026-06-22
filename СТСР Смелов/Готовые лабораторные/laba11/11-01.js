const fs = require("fs");
const path = require("path");
const WebSocket = require("ws");

const PORT = 4000;
const uploadDir = path.join(__dirname, "upload");
fs.mkdirSync(uploadDir, { recursive: true });

const wss = new WebSocket.Server({ port: PORT });
console.log(`11-01 WS server started on ws://localhost:${PORT}`);

wss.on("connection", (ws) => {
  ws.fileInfo = null;
  console.log("Client connected");

  ws.on("message", (data, isBinary) => {
    if (!isBinary) {
      try {
        const payload = JSON.parse(data.toString());
        if (payload.type === "file-meta" && payload.filename) {
          ws.fileInfo = payload;
          console.log(`Metadata received: ${payload.filename}`);
          return;
        }
      } catch (error) {
        ws.send(JSON.stringify({ ok: false, error: "Invalid JSON payload" }));
        return;
      }
      return;
    }

    const originalName = ws.fileInfo?.filename || "uploaded.bin";
    const safeName = path.basename(originalName);
    const fileName = `${Date.now()}-${safeName}`;
    const fullPath = path.join(uploadDir, fileName);

    fs.writeFile(fullPath, data, (error) => {
      if (error) {
        ws.send(JSON.stringify({ ok: false, error: error.message }));
        return;
      }
      ws.send(JSON.stringify({ ok: true, savedAs: fileName }));
      console.log(`Saved file: ${fileName}`);
    });
  });

  ws.on("close", () => console.log("Client disconnected"));
});
