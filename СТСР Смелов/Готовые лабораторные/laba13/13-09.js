const dgram = require('dgram');
const server = dgram.createSocket('udp4');

const PORT = 6000;

server.on('listening', () => {
    const address = server.address();
    console.log(`[13-09] 🚀 UDP Echo Server запущен на ${address.address}:${address.port}`);
});

server.on('message', (msg, rinfo) => {
    const message = msg.toString().trim();
    console.log(`[13-09] 📥 Получено от ${rinfo.address}:${rinfo.port} → "${message}"`);

    const response = `ECHO: ${message}`;
    
    server.send(response, rinfo.port, rinfo.address, (err) => {
        if (err) {
            console.error('[13-09] Ошибка отправки:', err);
        } else {
            console.log(`[13-09] 📤 Отправлен ответ: "${response}"`);
        }
    });
});

server.on('error', (err) => {
    console.error('[13-09] Ошибка сервера:', err);
    server.close();
});

server.bind(PORT);