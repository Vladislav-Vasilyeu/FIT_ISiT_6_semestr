const http = require('http');
const fs = require('fs');
const path = require('path');

const mimeTypes = {
  html: 'text/html',
  css: 'text/css',
  js: 'text/javascript',
  png: 'image/png',
  docx: 'application/msword',
  json: 'application/json',
  xml: 'application/xml',
  mp4: 'video/mp4',
};

function createStaticHandler(staticRootRelative) {
  const staticRoot = path.resolve(__dirname, staticRootRelative);

  return async function (req, res) {
    try {
      if (req.method !== 'GET') {
        res.writeHead(405, { 'Content-Type': 'text/plain' });
        res.end('405 Method Not Allowed');
        return;
      }

      const reqUrl = new URL(req.url, `http://localhost`);
      let pathname = decodeURIComponent(reqUrl.pathname);

      if (pathname === '/') {
        pathname = '/index.html';
      }

      
      const safePath = path.normalize(pathname).replace(/^\/+/, '');
      if (safePath.includes('..')) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
        return;
      }

      const ext = path.extname(safePath).slice(1).toLowerCase();
      const mimeType = mimeTypes[ext];
      if (!mimeType) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
        return;
      }

      const fullPath = path.join(staticRoot, safePath);
      if (!fullPath.startsWith(staticRoot)) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
        return;
      }

      fs.stat(fullPath, (err, stats) => {
        if (err || !stats.isFile()) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('404 Not Found');
          return;
        }

        res.writeHead(200, { 'Content-Type': mimeType });
        const stream = fs.createReadStream(fullPath);
        console.log(fullPath);
        stream.pipe(res);
        stream.on('error', () => {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('500 Internal Server Error');
        });
      });
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('500 Internal Server Error');
    }
  };
}

module.exports = { createStaticHandler };
