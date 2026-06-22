const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:4000');

let count = 0;
let startTime = Date.now();

ws.on('open', () => {
    console.log('Подключено к серверу');
    const interval = setInterval(() => {
        count++;
        const msg = `10-01-client: ${count}`;
        ws.send(msg);
        console.log('→', msg);

        if (Date.now() - startTime > 25000) {
            clearInterval(interval);
            ws.close();
        }
    }, 3000);
});

ws.on('message', (data) => {
    console.log('←', data.toString());
});

ws.on('close', () => {
    console.log('Соединение закрыто');
});