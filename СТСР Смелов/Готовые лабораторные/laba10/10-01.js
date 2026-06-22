const http = require('http');
const fs = require('fs');
const path = require('path');
const { WebSocketServer } = require('ws');

// ==================== HTTP Server (port 3000) ====================
const httpServer = http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/start') {
        const filePath = path.join(__dirname, 'index.html');
        
        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end('Ошибка чтения HTML-файла');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(data);
        });
    } else {
        res.writeHead(400);
        res.end('Bad Request');
    }
});

httpServer.listen(3000, () => {
    console.log('HTTP сервер запущен → http://localhost:3000/start');
});

// ==================== WebSocket Server (port 4000) ====================
const wss = new WebSocketServer({ port: 4000 });

wss.on('connection', (ws) => {
    console.log('Клиент WS подключился');
    let clientLastN = 0;
    let serverMsgCount = 0;

    const serverInterval = setInterval(() => {
        if (ws.readyState === ws.OPEN) {
            serverMsgCount++;
            const msg = `10-01-server: ${clientLastN}->${serverMsgCount}`;
            ws.send(msg);
            console.log('Сервер →', msg);
        }
    }, 5000);

    ws.on('message', (data) => {
        const msg = data.toString();
        console.log('От клиента:', msg);

        const match = msg.match(/10-01-client:\s*(\d+)/);
        if (match) clientLastN = parseInt(match[1]);
    });

    ws.on('close', () => {
        console.log('Клиент отключился');
        clearInterval(serverInterval);
    });
});

console.log('WebSocket сервер запущен на ws://localhost:4000');