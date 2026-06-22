const http = require('http');
const querystring = require('querystring');

const server = http.createServer((req, res) => {
  if (req.method === 'POST') {
    let body = '';
    
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      const params = querystring.parse(body);
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(`Получено: x=${params.x}, y=${params.y}, s=${params.s}`);
    });
  } else {
    res.writeHead(405);
    res.end('Method not allowed');
  }
});

server.listen(3003, () => console.log('Сервер 03 на порту 3003'));