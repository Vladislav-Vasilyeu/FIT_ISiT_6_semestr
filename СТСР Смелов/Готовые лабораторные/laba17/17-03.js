const { describeRedisError, formatMs, withRedis } = require('./redis-client');

const COUNT = 10_000;
const KEY = 'incr';

async function measure(label, action) {
  const start = process.hrtime.bigint();
  await action();
  const ms = formatMs(start);

  console.log(`${label}: ${ms.toFixed(2)} мс`);
  return ms;
}

withRedis(async (client) => {
  console.log(`Исследование скорости ${COUNT} операций incr/decr`);

  await client.set(KEY, 0);
  const incrTime = await measure(`incr('${KEY}')`, async () => {
    for (let n = 1; n <= COUNT; n += 1) {
      await client.incr(KEY);
    }
  });

  await client.set(KEY, 0);
  const decrTime = await measure(`decr('${KEY}')`, async () => {
    for (let n = 1; n <= COUNT; n += 1) {
      await client.decr(KEY);
    }
  });

  await client.del(KEY);

  console.table([
    { '#': 1, operation: "incr('incr')", ms: incrTime.toFixed(2) },
    { '#': 2, operation: "decr('incr')", ms: decrTime.toFixed(2) }
  ]);
}).catch((error) => {
  console.error('Ошибка выполнения 17-03:', describeRedisError(error));
  process.exitCode = 1;
});
