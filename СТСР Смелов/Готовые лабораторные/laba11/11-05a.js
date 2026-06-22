const { Client } = require("rpc-websockets");

function waitForClientOpen(client) {
  if (client.ready) return Promise.resolve();
  return new Promise((resolve, reject) => {
    client.on("open", resolve);
    client.on("error", reject);
  });
}

async function main() {
  const client = new Client("ws://localhost:4000", { autoconnect: false });
  const openPromise = waitForClientOpen(client);
  client.connect();
  await openPromise;

  // Allow protected calls for this lab demo.
  await client.login({ login: "student", password: "student" }).catch(() => {});

  const calls = [
    ["square", [3]],
    ["square", [5, 4]],
    ["sum", [2]],
    ["sum", [2, 4, 6, 8, 10]],
    ["mul", [3]],
    ["mul", [3, 5, 7, 9, 11, 13]],
    ["fib", [1]],
    ["fib", [2]],
    ["fib", [7]],
    ["fact", [0]],
    ["fact", [5]],
    ["fact", [10]]
  ];

  for (const [method, params] of calls) {
    const res = await client.call(method, params);
    console.log(`${method}(${params.join(",")}):`, res);
  }

  client.close();
}

main().catch((e) => console.error(e));

