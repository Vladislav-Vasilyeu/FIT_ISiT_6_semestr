const fs = require("fs");
const https = require("https");
const path = require("path");

const root = path.join(__dirname, "..");
const certDir = path.join(root, "certs");
const indexPath = path.join(__dirname, "index.html");
const port = Number(process.env.PORT || 8443);

const serverOptions = {
  key: fs.readFileSync(path.join(certDir, "rs-lab22-abc.key")),
  cert: fs.readFileSync(path.join(certDir, "rs-lab22-abc.crt")),
  ca: fs.readFileSync(path.join(certDir, "ca-lab22-xyz.crt")),
};

function send(res, statusCode, contentType, body) {
  res.writeHead(statusCode, {
    "Content-Type": contentType,
    "Cache-Control": "no-store",
  });
  res.end(body);
}

const server = https.createServer(serverOptions, (req, res) => {
  if (req.method !== "GET") {
    send(res, 405, "text/plain; charset=utf-8", "Метод не поддерживается. Используйте GET.");
    return;
  }

  if (req.url === "/status") {
    send(
      res,
      200,
      "application/json; charset=utf-8",
      JSON.stringify(
        {
          app: "22-01",
          protocol: "https",
          resourceCN: "RS-LAB22-ABC",
          allowedDomains: ["LAB22-ABC", "ABC"],
          status: "ok",
        },
        null,
        2
      )
    );
    return;
  }

  send(
    res,
    200,
    "text/html; charset=utf-8",
    fs.readFileSync(indexPath, "utf8")
  );
});

server.listen(port, () => {
  console.log(`22-01 HTTPS server: https://localhost:${port}/`);
  console.log(`Status endpoint: https://localhost:${port}/status`);
});
