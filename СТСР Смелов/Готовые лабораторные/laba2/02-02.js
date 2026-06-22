const http = require('http');
const fs = require('fs');
const hostname = 'localhost';
const port = 3000;
const server = http.createServer((req, res) => {
    if (req.url === '/png') {
        const png = fs.readFileSync('image/pic.png');
        res.statusCode = 200;
        res.setHeader('Content-Type', 'image/png');
        res.end(png);
    }
});



server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});