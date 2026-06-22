const http = require('http');
const url = require('url');

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  
  if (req.method === 'GET' && parsedUrl.pathname === '/') {
    const x = parseInt(parsedUrl.query.x) || 0;
    const y = parseInt(parsedUrl.query.y) || 0;
    const sum = x + y;
    
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(`Получены параметры: x=${x}, y=${y}. Сумма: ${sum}`);
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(3002, () => console.log('Сервер 02 на порту 3002'));