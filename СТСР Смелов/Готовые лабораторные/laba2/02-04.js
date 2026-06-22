const http = require('http');
const fs = require('fs');
const hostname = 'localhost';
const port = 5000;
const server = http.createServer((req, res) => {
    if (req.url === '/xmlhttprequest') {
        const html = fs.readFileSync('xmlhttprequest.html', 'utf8');
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');
        res.end(html);
    } else if (req.url === '/api/name') {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.end('Васильев Владислав Васильевич');
    } else {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/plain');
        res.end('404 Not Found');
    }
});
server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});