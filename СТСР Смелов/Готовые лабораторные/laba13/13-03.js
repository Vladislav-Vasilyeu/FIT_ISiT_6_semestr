const net = require('net');

const PORT = 4000;
const clients = new Map(); // socket -> { sum: number, id: number }

let clientCounter = 1;

const server = net.createServer((socket) => {
    const clientId = clientCounter++;
    console.log(`[13-03] Новый клиент #${clientId} подключился: ${socket.remoteAddress}:${socket.remotePort}`);

    clients.set(socket, { sum: 0, id: clientId });

    // Каждые 5 секунд отправляем сумму этому клиенту
    const interval = setInterval(() => {
        const data = clients.get(socket);
        if (data) {
            const message = `SUM: ${data.sum}`;
            socket.write(message + '\r\n');
            console.log(`[13-03] Клиент #${data.id} → отправлена сумма: ${data.sum}`);
        }
    }, 5000);

    socket.on('data', (data) => {
        const num = parseInt(data.toString().trim(), 10);
        if (!isNaN(num)) {
            const clientData = clients.get(socket);
            clientData.sum += num;
            console.log(`[13-03] Клиент #${clientData.id} получил число ${num} | Сумма = ${clientData.sum}`);
        }
    });

    socket.on('end', () => {
        clearInterval(interval);
        clients.delete(socket);
        console.log(`[13-03] Клиент #${clientId} отключился`);
    });

    socket.on('error', (err) => {
        clearInterval(interval);
        clients.delete(socket);
        console.error(`[13-03] Ошибка клиента #${clientId}:`, err.message);
    });
});

server.listen(PORT, () => {
    console.log(`[13-03] Sum Server запущен на порту ${PORT}`);
});