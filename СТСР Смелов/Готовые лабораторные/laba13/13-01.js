const net = require('net');

const PORT = 3000;

const server = net.createServer((socket) => {
    console.log(`[13-01] Клиент подключился: ${socket.remoteAddress}:${socket.remotePort}`);

    socket.on('data', (data) => {
        const message = data.toString().trim();
        console.log(`[13-01] Получено: "${message}"`);
        
        const response = `ECHO: ${message}`;
        socket.write(response + '\r\n');
    });

    socket.on('end', () => {
        console.log(`[13-01] Клиент отключился`);
    });
});

server.listen(PORT, () => {
    console.log(`[13-01] TCP Echo Server запущен на порту ${PORT}`);
});