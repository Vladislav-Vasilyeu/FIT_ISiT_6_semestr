const { createClient } = require('redis');
const fs = require('fs');
const path = require('path');

function loadEnvFile() {
  const envPath = path.join(__dirname, '.env');

  if (!fs.existsSync(envPath)) {
    return;
  }

  const content = fs.readFileSync(envPath, 'utf8');

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const separatorIndex = trimmed.indexOf('=');

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    if (key && !process.env[key]) {
      process.env[key] = value;
    }
  }
}

function describeRedisError(error) {
  if (!error) {
    return 'неизвестная ошибка';
  }

  if (error.message) {
    return error.message;
  }

  if (Array.isArray(error.errors) && error.errors.length > 0) {
    return error.errors
      .map((item) => item.message || item.code || String(item))
      .join('; ');
  }

  return error.code || String(error);
}

function createRedisClient() {
  loadEnvFile();

  const url = process.env.REDIS_URL || 'redis://localhost:6379';
  const client = createClient({
    url,
    socket: {
      connectTimeout: 5_000,
      reconnectStrategy: false
    }
  });

  client.on('error', (error) => {
    console.error('Redis error:', describeRedisError(error));
  });

  return client;
}

async function withRedis(callback) {
  const client = createRedisClient();

  try {
    await client.connect();
    await callback(client);
  } finally {
    if (client.isOpen) {
      await client.quit();
    }
  }
}

function formatMs(start) {
  return Number(process.hrtime.bigint() - start) / 1_000_000;
}

module.exports = {
  createRedisClient,
  describeRedisError,
  formatMs,
  withRedis
};
