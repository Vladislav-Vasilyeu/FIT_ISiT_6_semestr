const { createRedisClient, describeRedisError } = require('./redis-client');

const CHANNEL = 'lab17:channel';
const MESSAGES = [
  'Сообщение 1: publish/subscribe работает',
  'Сообщение 2: подписчик получает данные',
  'Сообщение 3: завершение демонстрации'
];

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const publisher = createRedisClient();
  const subscriber = publisher.duplicate();

  try {
    await publisher.connect();
    await subscriber.connect();

    await subscriber.subscribe(CHANNEL, (message) => {
      console.log(`Получено из канала ${CHANNEL}: ${message}`);
    });

    for (const message of MESSAGES) {
      await publisher.publish(CHANNEL, message);
      await wait(5000);
    }
  } finally {
    if (subscriber.isOpen) {
      await subscriber.unsubscribe(CHANNEL);
      await subscriber.quit();
    }

    if (publisher.isOpen) {
      await publisher.quit();
    }
  }
}

main().catch((error) => {
  console.error('Ошибка выполнения 17-05:', describeRedisError(error));
  process.exitCode = 1;
});
