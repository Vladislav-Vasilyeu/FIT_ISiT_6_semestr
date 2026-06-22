const net = require('net');

const PORT = 3000;
const HOST = '127.0.0.1';

const client = net.createConnection({ port: PORT, host: HOST }, () => {
    console.log('[13-02] Подключено к серверу 13-01');
});

const messages = ['Привет от Node.js!', 'Тестовое сообщение 123', 'Лабораторная 13', 'Конец связи'];

let i = 0;
const interval = setInterval(() => {
    if (i < messages.length) {
        client.write(messages[i] + '\r\n');
        console.log(`[13-02] Отправлено: ${messages[i]}`);
        i++;
    } else {
        clearInterval(interval);
        client.end();
    }
}, 1500);

client.on('data', (data) => {
    console.log(`[13-02] Ответ сервера: ${data.toString().trim()}`);
});

client.on('end', () => {
    console.log('[13-02] Соединение закрыто');
});