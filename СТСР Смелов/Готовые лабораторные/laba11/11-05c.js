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

  const s1 = await client.call("square", [3]);
  const s2 = await client.call("square", [5, 4]);
  const m1 = await client.call("mul", [3, 5, 7, 9, 11, 13]);
  const left = await client.call("sum", [s1, s2, m1]);

  const f = await client.call("fib", [7]); // array
  const m2 = await client.call("mul", [2, 4, 6]);

  const result = left + f.reduce((acc, v) => acc + v, 0) * m2;

  console.log("Expression result:", result);
  console.log("Details:");
  console.log("sum(square(3), square(5,4), mul(3,5,7,9,11,13)) =", left);
  console.log("fib(7) =", f);
  console.log("mul(2,4,6) =", m2);

  client.close();
}

main().catch((e) => console.error(e));

