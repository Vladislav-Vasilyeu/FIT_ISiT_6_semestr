const net = require('net');

const PORT = 5000;
const HOST = '127.0.0.1';

const X = parseInt(process.argv[2]);

if (isNaN(X)) {
    console.error('Ошибка: Укажите число X');
    console.error('Пример: node 13-06-client.js 7');
    process.exit(1);
}

const client = net.createConnection({ port: PORT, host: HOST }, () => {
    console.log(`[13-06] Клиент запущен с X = ${X}`);
});

let sentCount = 0;

const interval = setInterval(() => {
    sentCount++;
    client.write(X.toString() + '\r\n');
    console.log(`[13-06] → Отправлено: ${X} (${sentCount}/20)`);

    if (sentCount >= 20) {
        clearInterval(interval);
        setTimeout(() => client.end(), 1500);
    }
}, 1000);

client.on('data', (data) => {
    console.log(`[13-06] ← ${data.toString().trim()}`);
});

client.on('end', () => {
    console.log(`[13-06] Клиент завершил работу (отправлено ${sentCount} чисел)`);
});

client.on('error', (err) => {
    console.error('[13-06] Ошибка соединения:', err.message);
});