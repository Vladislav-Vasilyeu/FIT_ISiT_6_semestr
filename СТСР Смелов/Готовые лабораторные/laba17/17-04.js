const { describeRedisError, formatMs, withRedis } = require('./redis-client');

const COUNT = 10_000;
const HASH_KEY = 'lab17:hash';

async function measure(label, action) {
  const start = process.hrtime.bigint();
  await action();
  const ms = formatMs(start);

  console.log(`${label}: ${ms.toFixed(2)} мс`);
  return ms;
}

withRedis(async (client) => {
  console.log(`Исследование скорости ${COUNT} операций hset/hget`);

  await client.del(HASH_KEY);

  const hsetTime = await measure(`hset(n, '{id:n,val:\"val-n\"}'), n = 1...${COUNT}`, async () => {
    for (let n = 1; n <= COUNT; n += 1) {
      await client.hSet(HASH_KEY, String(n), JSON.stringify({ id: n, val: `val-${n}` }));
    }
  });

  const hgetTime = await measure(`hget(n), n = 1...${COUNT}`, async () => {
    for (let n = 1; n <= COUNT; n += 1) {
      await client.hGet(HASH_KEY, String(n));
    }
  });

  await client.del(HASH_KEY);

  console.table([
    { '#': 1, operation: 'hset(n, object)', ms: hsetTime.toFixed(2) },
    { '#': 2, operation: 'hget(n)', ms: hgetTime.toFixed(2) }
  ]);
}).catch((error) => {
  console.error('Ошибка выполнения 17-04:', describeRedisError(error));
  process.exitCode = 1;
});
