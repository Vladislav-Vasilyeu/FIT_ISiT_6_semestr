const http = require('http');
const xml2js = require('xml2js');

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/api/xml') {
    let body = '';
    
    req.on('data', (chunk) => body += chunk);
    req.on('end', async () => {
      try {
        const parser = new xml2js.Parser();
        const data = await parser.parseStringPromise(body);
        
        // Обработка данных
        const params = data.request.params[0];
        const a = parseInt(params.a[0]);
        const b = parseInt(params.b[0]);
        
        const responseObj = {
          response: {
            status: 'success',
            result: a + b,
            operation: data.request.operation[0],
            timestamp: new Date().toISOString()
          }
        };
        
        const builder = new xml2js.Builder();
        const xmlResponse = builder.buildObject(responseObj);
        
        res.writeHead(200, { 'Content-Type': 'application/xml' });
        res.end(xmlResponse);
        
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/xml' });
        res.end('<?xml version="1.0"?><error>Invalid XML</error>');
      }
    });
  }
});

server.listen(3005, () => console.log('Сервер 05 на порту 3005 (XML)'));