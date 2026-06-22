const { WebSocketServer } = require('ws');

const wss = new WebSocketServer({ port: 5000 });

wss.on('connection', (ws) => {
    console.log('Клиент подключился. Всего клиентов:', wss.clients.size);

    ws.on('message', (data) => {
        const msg = data.toString();
        console.log('Получено:', msg);

        // Отправляем ВСЕМ клиентам
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(`[BROADCAST] ${msg}`);
            }
        });
    });

    ws.on('close', () => {
        console.log('Клиент отключился. Осталось:', wss.clients.size);
    });
});

console.log('Широковещательный WS сервер на ws://localhost:5000');