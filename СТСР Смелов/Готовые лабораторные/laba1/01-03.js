const http = require('http');
const url = require('url');

const hostname = 'localhost';
const port = 3000;
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);

    // Собираем тело запроса
    const chunks = [];
    req.on('data', (chunk) => {
        chunks.push(chunk);
    });

    req.on('end', () => {
        const rawBody = Buffer.concat(chunks).toString();
        let parsedBody = null;
        try {
            if (rawBody) parsedBody = JSON.parse(rawBody);
        } catch (e) {
            parsedBody = null;
        }

        const requestInfo = {
            method: req.method,
            url: req.url,
            pathname: parsedUrl.pathname,
            query: parsedUrl.query,
            headers: req.headers,
            httpVersion: req.httpVersion,
            body: rawBody,
            parsedBody: parsedBody
        }

        console.log('Request body:', rawBody);

        function escapeHtml(s) {
            if (!s) return '';
            return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        }

        const html = `

        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Document</title>
        </head>
        <body>

        <h1>Request Information</h1>
        <p>Method: ${requestInfo.method}</p>
        <p>URL: ${requestInfo.url}</p>
        <p>Pathname: ${requestInfo.pathname}</p>
        <p>Query: ${JSON.stringify(requestInfo.query)}</p>
        <p>Headers: ${JSON.stringify(requestInfo.headers)}</p>
        <p>HTTP Version: ${requestInfo.httpVersion}</p>
        <h2>Body (raw)</h2>
        <pre>${escapeHtml(requestInfo.body)}</pre>
        
        </body>
        </html>
        `

        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');
        res.end(html);
    });

    req.on('error', (err) => {
        console.error('Request error:', err);
        res.statusCode = 400;
        res.end('Bad request');
    });
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
