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
  await client.login({ login: "student", password: "student" }).catch(() => {});

  const calls = [
    { method: "square", params: [3] },
    { method: "square", params: [5, 4] },
    { method: "sum", params: [2] },
    { method: "sum", params: [2, 4, 6, 8, 10] },
    { method: "mul", params: [3] },
    { method: "mul", params: [3, 5, 7, 9, 11, 13] },
    { method: "fib", params: [1] },
    { method: "fib", params: [2] },
    { method: "fib", params: [7] },
    { method: "fact", params: [0] },
    { method: "fact", params: [5] },
    { method: "fact", params: [10] }
  ];

  const results = await Promise.all(
    calls.map(async (c) => {
      const res = await client.call(c.method, c.params);
      return { ...c, res };
    })
  );

  for (const r of results) {
    console.log(`${r.method}(${r.params.join(",")}):`, r.res);
  }

  client.close();
}

main().catch((e) => console.error(e));

