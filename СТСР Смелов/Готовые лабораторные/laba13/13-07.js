const net = require('net');

const PORTS = [40000, 50000];

function createServer(port) {
    const server = net.createServer((socket) => {
        console.log(`[13-07] ✅ Клиент подключился к порту ${port} | ${socket.remoteAddress}:${socket.remotePort}`);

        socket.on('data', (data) => {
            const message = data.toString().trim();
            console.log(`[13-07] Порт ${port} ← Получено: "${message}"`);
            
            const response = `ECHO (порт ${port}): ${message}`;
            socket.write(response + '\r\n');
        });

        socket.on('end', () => {
            console.log(`[13-07] Порт ${port} — клиент отключился`);
        });

        socket.on('error', (err) => {
            console.error(`[13-07] Порт ${port} — ошибка:`, err.message);
        });
    });

    server.listen(port, () => {
        console.log(`[13-07] 🚀 Сервер запущен на порту ${port}`);
    });

    return server;
}

// Запускаем серверы на двух портах
PORTS.forEach(port => createServer(port));

console.log('[13-07] Сервер слушает оба порта: 40000 и 50000');