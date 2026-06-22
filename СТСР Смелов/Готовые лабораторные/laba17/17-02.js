const { describeRedisError, formatMs, withRedis } = require('./redis-client');

const COUNT = 10_000;

async function measure(label, action) {
  const start = process.hrtime.bigint();
  await action();
  const ms = formatMs(start);

  console.log(`${label}: ${ms.toFixed(2)} мс`);
  return ms;
}

withRedis(async (client) => {
  console.log(`Исследование скорости ${COUNT} операций set/get/del`);

  const setTime = await measure(`set(n, 'setn'), n = 1...${COUNT}`, async () => {
    for (let n = 1; n <= COUNT; n += 1) {
      await client.set(String(n), `set${n}`);
    }
  });

  const getTime = await measure(`get(n), n = 1...${COUNT}`, async () => {
    for (let n = 1; n <= COUNT; n += 1) {
      await client.get(String(n));
    }
  });

  const delTime = await measure(`del(n), n = 1...${COUNT}`, async () => {
    for (let n = 1; n <= COUNT; n += 1) {
      await client.del(String(n));
    }
  });

  console.table([
    { '#': 1, operation: "set(n, 'setn')", ms: setTime.toFixed(2) },
    { '#': 2, operation: 'get(n)', ms: getTime.toFixed(2) },
    { '#': 3, operation: 'del(n)', ms: delTime.toFixed(2) }
  ]);
}).catch((error) => {
  console.error('Ошибка выполнения 17-02:', describeRedisError(error));
  process.exitCode = 1;
});
