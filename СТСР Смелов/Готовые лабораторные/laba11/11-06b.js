const { Client } = require("rpc-websockets");

function waitForClientOpen(client) {
  if (client.ready) return Promise.resolve();
  return new Promise((resolve, reject) => {
    client.on("open", resolve);
    client.on("error", reject);
  });
}

async function main() {
  const client = new Client("ws://localhost:40000", { autoconnect: false });
  const openPromise = waitForClientOpen(client);
  client.connect();
  await openPromise;

  await client.subscribe("B");
  console.log("Subscribed to event B");

  client.on("B", (data) => console.log("Event B:", data));
}

main().catch((e) => console.error(e));

