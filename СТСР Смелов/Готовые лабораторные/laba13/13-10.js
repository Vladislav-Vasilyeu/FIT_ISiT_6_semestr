const dgram = require('dgram');
const client = dgram.createSocket('udp4');

const PORT = 6000;
const HOST = '127.0.0.1';

const messages = [
    'Привет из UDP клиента!',
    'Лабораторная работа 13',
    'Лабораторная по Node.js',
    'Тестовое сообщение UDP',
    'Завершение передачи'
];

let i = 0;

console.log('[13-10] UDP клиент запущен');

const interval = setInterval(() => {
    if (i < messages.length) {
        const msg = Buffer.from(messages[i]);
        client.send(msg, PORT, HOST, (err) => {
            if (err) console.error(err);
            else console.log(`[13-10] → Отправлено: "${messages[i]}"`);
        });
        i++;
    } else {
        clearInterval(interval);
        setTimeout(() => {
            client.close();
            console.log('[13-10] Клиент завершил работу');
        }, 500);
    }
}, 1200);

client.on('message', (msg, rinfo) => {
    console.log(`[13-10] ← От сервера: ${msg.toString()}`);
});

client.on('error', (err) => {
    console.error('[13-10] Ошибка:', err);
});