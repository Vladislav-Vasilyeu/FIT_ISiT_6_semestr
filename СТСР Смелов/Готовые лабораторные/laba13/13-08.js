const net = require('net');

const HOST = '127.0.0.1';
const PORT = parseInt(process.argv[2]);   // Номер порта из командной строки
const X = parseInt(process.argv[3]) || 5; // Число X (по умолчанию 5)

if (!PORT || ![40000, 50000].includes(PORT)) {
    console.error('Ошибка! Укажите корректный порт: 40000 или 50000');
    console.error('Пример: node 13-08-multiport-client.js 40000');
    process.exit(1);
}

const client = net.createConnection({ port: PORT, host: HOST }, () => {
    console.log(`[13-08] ✅ Подключено к серверу на порту ${PORT} | X = ${X}`);
});

let count = 0;

const interval = setInterval(() => {
    count++;
    client.write(X.toString() + '\r\n');
    console.log(`[13-08] → [Порт ${PORT}] Отправлено: ${X}`);

    if (count >= 10) {
        clearInterval(interval);
        setTimeout(() => client.end(), 1000);
    }
}, 1000);

client.on('data', (data) => {
    console.log(`[13-08] ← [Порт ${PORT}] ${data.toString().trim()}`);
});

client.on('end', () => {
    console.log(`[13-08] Клиент на порту ${PORT} завершил работу`);
});

client.on('error', (err) => {
    console.error(`[13-08] Ошибка клиента на порту ${PORT}:`, err.message);
});