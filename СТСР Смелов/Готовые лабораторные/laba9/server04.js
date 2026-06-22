const http = require('http');

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/api/data') {
    let body = '';
    
    req.on('data', (chunk) => body += chunk);
    req.on('end', () => {
      try {
        const received = JSON.parse(body);
        const response = {
          success: true,
          received: received,
          processed: {
            ...received,
            timestamp: new Date().toISOString(),
            length: received.values ? received.values.length : 0
          }
        };
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(response));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
  }
});

server.listen(3004, () => console.log('Сервер 04 на порту 3004 (JSON)'));