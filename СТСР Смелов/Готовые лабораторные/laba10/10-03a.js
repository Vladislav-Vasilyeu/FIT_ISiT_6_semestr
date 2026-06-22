const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:5000');

ws.on('open', () => {
    console.log('Подключён');
    setInterval(() => {
        ws.send(`Привет от клиента ${process.pid}`);
    }, 2000);
});

ws.on('message', (data) => {
    console.log('Получено:', data.toString());
});