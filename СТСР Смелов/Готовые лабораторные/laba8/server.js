const fs = require('fs');
const path = require('path');
const http = require('http');
const url = require('url');
const querystring = require('querystring');


let keepAliveTimeout = 5000;
const PORT = 3000;
const STATIC_DIR = path.join(__dirname, 'static');
const TEMPLATES_DIR = path.join(__dirname, 'templates');

if (!fs.existsSync(STATIC_DIR)) {
    fs.mkdirSync(STATIC_DIR, { recursive: true });
}

function loadTemplate(filename) {
    try {
        return fs.readFileSync(path.join(TEMPLATES_DIR, filename), 'utf8');
    } catch (err) {
        return `<h1>Ошибка загрузки шаблона ${filename}</h1><p>${err.message}</p>`;
    }
}

function parseJSON(body) {
    try {
        return JSON.parse(body);
    } catch {
        return null;
    }
}

function parseXML(body) {
    const result = { x: [], m: [] };

    const xRegex = new RegExp('<xx[^>]*value="([^"]*)"[^>]*>', 'g');
    let xMatch;
    while ((xMatch = xRegex.exec(body)) !== null) {
        result.x.push(parseInt(xMatch[1]) || 0);
    }

    const mRegex = new RegExp('<mm[^>]*value="([^"]*)"[^>]*>', 'g');
    let mMatch;
    while ((mMatch = mRegex.exec(body)) !== null) {
        result.m.push(mMatch[1]);
    }

    return result;
}

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const query = parsedUrl.query;

    server.keepAliveTimeout = keepAliveTimeout;
    console.log(`${req.method} ${req.url}`);

    if (pathname === '/connection') {
        if (query.set) {
            const newValue = parseInt(query.set);
            if (!isNaN(newValue)) {
                keepAliveTimeout = newValue;
                server.keepAliveTimeout = newValue;
                res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
                res.end(`Установлено новое значение параметра KeepAliveTimeout=${newValue}`);
            } else {
                res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
                res.end('Некорректное значение параметра set');
            }
        } else {
            res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end(`Текущее значение KeepAliveTimeout: ${keepAliveTimeout} мс`);
        }
        return;
    }

    if (pathname === '/headers' && req.method === 'GET') {
        let requestHeaders = '<h2>Заголовки запроса:</h2><ul>';
        for (const [key, value] of Object.entries(req.headers)) {
            requestHeaders += `<li><b>${key}:</b> ${value}</li>`;
        }
        requestHeaders += '</ul>';

        res.setHeader('X-Custom-Header', 'MyCustomValue');
        res.setHeader('X-Powered-By', 'Node.js Server');

        let responseHeaders = '<h2>Заголовки ответа:</h2><ul>';
        responseHeaders += `<li><b>Content-Type:</b> text/html; charset=utf-8</li>`;
        responseHeaders += `<li><b>X-Custom-Header:</b> MyCustomValue</li>`;
        responseHeaders += `<li><b>X-Powered-By:</b> Node.js Server</li>`;
        responseHeaders += '</ul>';

        const explanation = `
            <h2>Назначение заголовков:</h2>
            <ul>
                <li><b>host</b> - доменное имя сервера</li>
                <li><b>connection</b> - управление соединением</li>
                <li><b>accept</b> - типы контента, которые клиент принимает</li>
                <li><b>user-agent</b> - информация о браузере</li>
                <li><b>content-type</b> - формат данных</li>
                <li><b>X-Custom-Header</b> - пользовательский заголовок</li>
            </ul>
        `;

        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`<html><body>${requestHeaders}${responseHeaders}${explanation}</body></html>`);
        return;
    }

    if (pathname === '/parameter' && req.method === 'GET') {
        const x = query.x;
        const y = query.y;

        const numX = parseFloat(x);
        const numY = parseFloat(y);

        if (!isNaN(numX) && !isNaN(numY)) {
            const sum = numX + numY;
            const diff = numX - numY;
            const prod = numX * numY;
            const quot = numY !== 0 ? (numX / numY) : 'деление на ноль';

            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(`
                <h2>Результаты операций:</h2>
                <p>x = ${numX}, y = ${numY}</p>
                <ul>
                    <li>Сумма: ${sum}</li>
                    <li>Разность: ${diff}</li>
                    <li>Произведение: ${prod}</li>
                    <li>Частное: ${quot}</li>
                </ul>
            `);
        } else {
            res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('Ошибка: x и y должны быть числами');
        }
        return;
    }

    const paramMatch = pathname.match(/^\/parameter\/([^\/]+)\/([^\/]+)$/);
    if (paramMatch && req.method === 'GET') {
        const x = decodeURIComponent(paramMatch[1]);
        const y = decodeURIComponent(paramMatch[2]);

        const numX = parseFloat(x);
        const numY = parseFloat(y);

        if (!isNaN(numX) && !isNaN(numY)) {
            const sum = numX + numY;
            const diff = numX - numY;
            const prod = numX * numY;
            const quot = numY !== 0 ? (numX / numY) : 'деление на ноль';

            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(`
                <h2>Результаты операций:</h2>
                <p>x = ${numX}, y = ${numY}</p>
                <ul>
                    <li>Сумма: ${sum}</li>
                    <li>Разность: ${diff}</li>
                    <li>Произведение: ${prod}</li>
                    <li>Частное: ${quot}</li>
                </ul>
            `);
        } else {
            res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end(`URI: ${req.url}`);
        }
        return;
    }

    if (pathname === '/close' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Сервер будет остановлен через 10 секунд...');

        setTimeout(() => {
            console.log('Сервер остановлен');
            server.close(() => process.exit(0));
        }, 10000);
        return;
    }

    if (pathname === '/socket' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
            <h2>Информация о сокете:</h2>
            <h3>Клиент:</h3>
            <ul>
                <li>IP: ${req.socket.remoteAddress}</li>
                <li>Порт: ${req.socket.remotePort}</li>
            </ul>
            <h3>Сервер:</h3>
            <ul>
                <li>IP: ${req.socket.localAddress}</li>
                <li>Порт: ${req.socket.localPort}</li>
            </ul>
        `);
        return;
    }

    if (pathname === '/req-data') {
        let chunks = [];
        let chunkCount = 0;

        req.on('data', (chunk) => {
            chunks.push(chunk);
            chunkCount++;
            console.log(`Chunk #${chunkCount}: ${chunk.length} байт`);
        });

        req.on('end', () => {
            const body = Buffer.concat(chunks).toString();
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(`
                <h2>Порционная обработка</h2>
                <p>Получено chunk'ов: ${chunkCount}</p>
                <p>Общий размер: ${body.length} байт</p>
                <pre>${body.substring(0, 1000)}</pre>
            `);
        });
        return;
    }

    if (pathname === '/resp-status' && req.method === 'GET') {
        const code = parseInt(query.code) || 200;
        const mess = query.mess || 'OK';

        res.writeHead(code, mess, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(`Статус: ${code}, Сообщение: ${mess}`);
        return;
    }

    if (pathname === '/formparameter') {
        if (req.method === 'GET') {
            // Загружаем HTML из файла
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(loadTemplate('form.html'));
        } else if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', () => {
                const params = querystring.parse(body);

                let result = `
                    <html>
                    <head>
                        <meta charset="UTF-8">
                        <title>Результат - Задание 09</title>
                        <style>
                            body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
                            h2 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
                            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
                            th { background: #007bff; color: white; }
                            tr:hover { background: #f5f5f5; }
                            .back { display: inline-block; margin-top: 20px; padding: 10px 20px; 
                                   background: #007bff; color: white; text-decoration: none; border-radius: 4px; }
                            .back:hover { background: #0056b3; }
                        </style>
                    </head>
                    <body>
                        <h2>Полученные параметры формы (Задание 09)</h2>
                        <table>
                            <tr><th>Параметр (name)</th><th>Значение (value)</th><th>Тип input</th></tr>
                `;

                const fieldInfo = {
                    'text_field': 'type="text"',
                    'number_field': 'type="number"',
                    'date_field': 'type="date"',
                    'checkbox_field': 'type="checkbox"',
                    'radio_field': 'type="radio"',
                    'textarea_field': 'textarea',
                    'submit_btn': 'type="submit" (две кнопки с одинаковым name)'
                };

                for (const [key, value] of Object.entries(params)) {
                    const displayValue = Array.isArray(value) ? value.join(' | ') : value;
                    const info = fieldInfo[key] || '';
                    result += `<tr><td><b>${key}</b></td><td>${displayValue}</td><td><i>${info}</i></td></tr>`;
                }

                result += `
                        </table>
                        <a href="/formparameter" class="back">← Вернуться к форме</a>
                    </body>
                    </html>
                `;

                res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(result);
            });
        }
        return;
    }

    if (pathname === '/json' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            const data = parseJSON(body);
            if (!data) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid JSON' }));
                return;
            }

            const x = parseInt(data.x) || 0;
            const y = parseInt(data.y) || 0;
            const s = data.s || '';
            const o = data.o || {};
            const m = data.m || [];

            let oString = '';
            for (const key in o) {
                oString += `${key}:${o[key]};`;
            }

            const response = {
                "x+y": x + y,
                "Concatination_s_o": s + oString,
                "Length_m": m.length
            };

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(response, null, 2));
        });
        return;
    }

    if (pathname === '/xml' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            const data = parseXML(body);

            const sumX = data.x.reduce((a, b) => a + b, 0);
            const concatM = data.m.join('');

            const responseXML = `<?xml version="1.0" encoding="UTF-8"?>
<response>
    <sum element="xx" result="${sumX}">${sumX}</sum>
    <concat element="mm" result="${concatM}">${concatM}</concat>
</response>`;

            res.writeHead(200, { 'Content-Type': 'application/xml' });
            res.end(responseXML);
        });
        return;
    }

    if (pathname === '/files' && req.method === 'GET') {
        fs.readdir(STATIC_DIR, (err, files) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Server Error');
                return;
            }

            let fileCount = 0;
            let checked = 0;

            if (files.length === 0) {
                res.writeHead(200, {
                    'Content-Type': 'text/plain',
                    'X-static-files-count': '0'
                });
                res.end('Файлов: 0');
                return;
            }

            files.forEach(file => {
                fs.stat(path.join(STATIC_DIR, file), (err, stats) => {
                    checked++;
                    if (!err && stats.isFile()) fileCount++;

                    if (checked === files.length) {
                        res.writeHead(200, {
                            'Content-Type': 'text/plain',
                            'X-static-files-count': fileCount.toString()
                        });
                        res.end(`Файлов в static: ${fileCount}`);
                    }
                });
            });
        });
        return;
    }

    const fileMatch = pathname.match(/^\/files\/(.+)$/);
    if (fileMatch && req.method === 'GET') {
        const filename = decodeURIComponent(fileMatch[1]);
        const filePath = path.join(STATIC_DIR, filename);

        if (!filePath.startsWith(STATIC_DIR)) {
            res.writeHead(403, { 'Content-Type': 'text/plain' });
            res.end('Forbidden');
            return;
        }

        fs.access(filePath, fs.constants.F_OK, (err) => {
            if (err) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('File Not Found');
                return;
            }

            fs.readFile(filePath, (err, data) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('Server Error');
                    return;
                }

                const ext = path.extname(filename).toLowerCase();
                const contentTypes = {
                    '.html': 'text/html', '.htm': 'text/html',
                    '.js': 'application/javascript', '.css': 'text/css',
                    '.json': 'application/json', '.png': 'image/png',
                    '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
                    '.gif': 'image/gif', '.txt': 'text/plain'
                };

                res.writeHead(200, {
                    'Content-Type': contentTypes[ext] || 'application/octet-stream'
                });
                res.end(data);
            });
        });
        return;
    }

    if (pathname === '/upload') {
        if (req.method === 'GET') {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(loadTemplate('upload.html'));
        } else if (req.method === 'POST') {
            let body = Buffer.alloc(0);
            req.on('data', chunk => {
                body = Buffer.concat([body, chunk]);
            });

            req.on('end', () => {
                const contentType = req.headers['content-type'];
                const boundaryMatch = contentType.match(/boundary=([^;]+)/);
                const boundary = boundaryMatch ? boundaryMatch[1] : null;

                if (!boundary) {
                    res.writeHead(400, { 'Content-Type': 'text/plain' });
                    res.end('Bad Request: no boundary');
                    return;
                }

                const boundaryBuffer = Buffer.from('--' + boundary);
                const parts = [];
                let start = 0;

                while (true) {
                    const idx = body.indexOf(boundaryBuffer, start);
                    if (idx === -1) break;

                    const nextIdx = body.indexOf(boundaryBuffer, idx + boundaryBuffer.length);
                    if (nextIdx === -1) break;

                    let part = body.slice(idx + boundaryBuffer.length, nextIdx);
                    if (part.slice(0, 2).toString() === '\r\n') part = part.slice(2);
                    if (part.slice(-2).toString() === '\r\n') part = part.slice(0, -2);

                    parts.push(part);
                    start = nextIdx;
                }

                let fileData = null;
                let fileName = null;

                for (const part of parts) {
                    const headerEnd = part.indexOf('\r\n\r\n');
                    if (headerEnd === -1) continue;

                    const header = part.slice(0, headerEnd).toString();
                    const data = part.slice(headerEnd + 4);

                    const filenameMatch = header.match(/filename="([^"]+)"/);
                    if (filenameMatch) {
                        fileName = filenameMatch[1];
                        fileData = data;
                        if (data.slice(-2).toString() === '\r\n') {
                            fileData = data.slice(0, -2);
                        }
                        break;
                    }
                }

                if (fileName && fileData) {
                    const filePath = path.join(STATIC_DIR, fileName);
                    fs.writeFile(filePath, fileData, (err) => {
                        if (err) {
                            res.writeHead(500, { 'Content-Type': 'text/plain' });
                            res.end('Error saving file');
                            return;
                        }
                        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                        res.end(`<h2>Файл ${fileName} загружен!</h2><p>Размер: ${fileData.length} байт</p>`);
                    });
                } else {
                    res.writeHead(400, { 'Content-Type': 'text/plain' });
                    res.end('No file found');
                }
            });
        }
        return;
    }

    // 404
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
});

server.listen(PORT, () => {
    console.log(`Сервер: http://localhost:${PORT}`);
    console.log('Маршруты:');
    console.log('  GET  /connection?set=5000');
    console.log('  GET  /headers');
    console.log('  GET  /parameter?x=10&y=5');
    console.log('  GET  /parameter/10/5');
    console.log('  GET  /close');
    console.log('  GET  /socket');
    console.log('  GET  /req-data');
    console.log('  GET  /resp-status?code=404&mess=Not%20Found');
    console.log('  GET/POST  /formparameter  <- Задание 09');
    console.log('  POST /json');
    console.log('  POST /xml');
    console.log('  GET  /files');
    console.log('  GET  /files/test.txt');
    console.log('  GET/POST  /upload');
});
