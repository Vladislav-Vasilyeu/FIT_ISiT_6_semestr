const { describeRedisError, withRedis } = require('./redis-client');

withRedis(async (client) => {
  const pong = await client.ping();

  await client.set('lab17:connection', 'Redis connection is working');
  const value = await client.get('lab17:connection');
  await client.del('lab17:connection');

  console.log('PING:', pong);
  console.log('GET lab17:connection:', value);
  console.log('Соединение с Redis успешно установлено.');
}).catch((error) => {
  console.error('Не удалось подключиться к Redis:', describeRedisError(error));
  process.exitCode = 1;
});
