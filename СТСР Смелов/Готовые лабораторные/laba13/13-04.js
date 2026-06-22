const net = require('net');

const PORT = 4000;
const HOST = '127.0.0.1';
const X = parseInt(process.argv[2]) || 1; // Число X передаётся параметром

if (isNaN(X)) {
    console.error('Использование: node 13-04-sum-client.js <число>');
    process.exit(1);
}

const client = net.createConnection({ port: PORT, host: HOST }, () => {
    console.log(`[13-04] Клиент запущен с X = ${X}`);
});

let count = 0;
const interval = setInterval(() => {
    count++;
    client.write(X.toString() + '\r\n');
    console.log(`[13-04] Отправлено: ${X}`);

    if (count >= 20) {
        clearInterval(interval);
        setTimeout(() => {
            client.end();
        }, 1000);
    }
}, 1000);

client.on('data', (data) => {
    console.log(`[13-04] Получено от сервера: ${data.toString().trim()}`);
});

client.on('end', () => {
    console.log(`[13-04] Клиент завершил работу (отправлено ${count} чисел)`);
});

client.on('error', (err) => {
    console.error('[13-04] Ошибка:', err.message);
});