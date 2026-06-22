const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  if (req.url === '/download' && req.method === 'GET') {
    const filePath = path.join(__dirname, 'MyFile.txt'); 
    
    // Проверяем существование файла
    if (!fs.existsSync(filePath)) {
      res.writeHead(404);
      res.end('File not found');
      return;
    }
    
    const stat = fs.statSync(filePath);
    const filename = path.basename(filePath);
    
    res.writeHead(200, {
      'Content-Type': 'application/octet-stream',
      'Content-Length': stat.size,
      'Content-Disposition': `attachment; filename="${filename}"`
    });
    
    const readStream = fs.createReadStream(filePath);
    readStream.pipe(res);
    
    readStream.on('error', (err) => {
      console.error('Ошибка чтения файла:', err);
      res.end();
    });
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(3008, () => console.log('Сервер 08 на порту 3008 (file download)'));