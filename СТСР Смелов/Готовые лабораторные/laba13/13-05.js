const net = require('net');

const PORT = 5000;
const clients = new Map(); // socket -> { id: number, sum: number }
let clientCounter = 1;

const server = net.createServer((socket) => {
    const clientId = clientCounter++;
    console.log(`[13-05] ✅ Новый клиент #${clientId} | ${socket.remoteAddress}:${socket.remotePort}`);

    clients.set(socket, { id: clientId, sum: 0 });

    // Таймер отправки суммы каждые 5 секунд
    const sendInterval = setInterval(() => {
        const clientData = clients.get(socket);
        if (clientData) {
            const msg = `SUM_CLIENT_${clientData.id}: ${clientData.sum}`;
            socket.write(msg + '\r\n');
            console.log(`[13-05] → Клиент #${clientData.id} | Отправлена сумма: ${clientData.sum}`);
        }
    }, 5000);

    socket.on('data', (data) => {
        const numStr = data.toString().trim();
        const num = parseInt(numStr, 10);

        if (!isNaN(num)) {
            const clientData = clients.get(socket);
            clientData.sum += num;
            console.log(`[13-05] 📥 Клиент #${clientData.id} получил ${num} | Текущая сумма = ${clientData.sum}`);
        } else {
            console.log(`[13-05] ⚠️  Клиент #${clientId} отправил некорректные данные: "${numStr}"`);
        }
    });

    socket.on('end', () => {
        clearInterval(sendInterval);
        clients.delete(socket);
        console.log(`[13-05] ❌ Клиент #${clientId} отключился`);
    });

    socket.on('error', (err) => {
        clearInterval(sendInterval);
        clients.delete(socket);
        console.error(`[13-05] ❌ Ошибка клиента #${clientId}:`, err.message);
    });
});

server.listen(PORT, () => {
    console.log(`[13-05] 🚀 Advanced Sum Server запущен на порту ${PORT}`);
    console.log(`[13-05] Ожидание подключений...`);
});