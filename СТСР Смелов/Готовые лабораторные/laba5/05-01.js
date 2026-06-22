const http = require('http');
const url = require('url');
const DB = require('./DB');
const fs = require('fs');
const readline = require('readline');

const db = new DB();

let sdTimer = null;
let scTimer = null;
let ssTimer = null;

const stats = {
    start: null,
    finish: null,
    request: 0,
    commit: 0,
    collecting: false
};

function formatDateTime(date) {
    if (!date) return '';
    return date.toISOString().replace('T', ' ').split('.')[0];
}


const corsHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Accept'
};

// Подписка на события для логирования
db.on('GET', (data) => console.log(`[GET] Получено ${data.length} записей`));
db.on('POST', (row) => console.log(`[POST] Добавлена запись:`, row));
db.on('PUT', (row) => console.log(`[PUT] Обновлена запись:`, row));
db.on('DELETE', (row) => console.log(`[DELETE] Удалена запись:`, row));
db.on('COMMIT', () => {
    console.log('[COMMIT] Commit');
    if (stats.collecting) {
        stats.commit += 1;
    }
});

// Парсинг тела запроса
function parseBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch (e) {
                reject(new Error('Неверный JSON формат'));
            }
        });
    });
}

// Отправка JSON ответа
function sendJson(res, statusCode, data) {
    res.writeHead(statusCode, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Accept'
    });
    res.end(JSON.stringify(data));
}

function stopStats() {
    if (!stats.collecting) return;
    stats.collecting = false;
    stats.finish = new Date();
    if (ssTimer) {
        clearTimeout(ssTimer);
        ssTimer = null;
    }
    console.log('[ss] Сбор статистики завершен');
}

function startStats(seconds) {
    if (ssTimer) {
        clearTimeout(ssTimer);
        ssTimer = null;
    }
    stats.start = new Date();
    stats.finish = null;
    stats.request = 0;
    stats.commit = 0;
    stats.collecting = true;

    ssTimer = setTimeout(() => {
        stopStats();
    }, seconds * 1000);
    ssTimer.unref();

    console.log(`[ss] Сбор статистики запущен на ${seconds} секунд`);
}

function handleCommand(line) {
    const parts = line.trim().split(/\s+/);
    if (!parts[0]) return;

    const cmd = parts[0];
    const arg = parts[1];

    switch (cmd) {
        case 'sd':
            if (sdTimer) {
                clearTimeout(sdTimer);
                sdTimer = null;
            }
            if (!arg) {
                console.log('[sd] Отмена остановки сервера');
                return;
            }
            const sdSeconds = Number(arg);
            if (Number.isNaN(sdSeconds) || sdSeconds < 0) {
                console.log('[sd] Необходимо положительное число секунд');
                return;
            }
            sdTimer = setTimeout(() => {
                console.log(`[sd] Постановка сервера на остановку через ${sdSeconds} секунд выполнена`);
                server.close(() => {
                    console.log('Сервер остановлен. Выход.');
                    process.exit(0);
                });
            }, sdSeconds * 1000);
            sdTimer.unref();
            console.log(`[sd] Сервер будет остановлен через ${sdSeconds} секунд`);
            break;

        case 'sc':
            if (scTimer) {
                clearInterval(scTimer);
                scTimer = null;
            }
            if (!arg) {
                console.log('[sc] Периодический commit остановлен');
                return;
            }
            const scSeconds = Number(arg);
            if (Number.isNaN(scSeconds) || scSeconds <= 0) {
                console.log('[sc] Необходимо положительное число секунд');
                return;
            }
            scTimer = setInterval(async () => {
                try {
                    await db.commit();
                } catch (ex) {
                    console.error('[sc] Ошибка commit:', ex.message);
                }
            }, scSeconds * 1000);
            scTimer.unref();
            console.log(`[sc] Периодический commit каждый ${scSeconds} секунд запущен`);
            break;

        case 'ss':
            if (!arg) {
                stopStats();
                return;
            }
            const ssSeconds = Number(arg);
            if (Number.isNaN(ssSeconds) || ssSeconds <= 0) {
                console.log('[ss] Необходимо положительное число секунд');
                return;
            }
            startStats(ssSeconds);
            break;

        default:
            console.log(`Неизвестная команда: ${cmd}`);
    }
}

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
rl.on('line', handleCommand);

const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;
    const method = req.method;

    

    if (path === "/") {
        if (stats.collecting) {
        stats.request += 1;
    }
        fs.readFile('index.html', (err, html) => {
            if (err) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'text/plain');
                res.end('500 Internal  Server Error: cannot read file');
                return;
            }
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.end(html);
        });

    }

    // CORS preflight
    if (method === 'OPTIONS') {
        if (stats.collecting) {
        stats.request += 1;
    }
        res.writeHead(200, corsHeaders);
        res.end();
        return;
    }

    // Проверяем маршрут /api/db
    if (path === '/api/db') {
        if (stats.collecting) {
        stats.request += 1;
    }
        try {
            switch (method) {
                case 'GET':
                    // Получить все строки
                    const allRows = await db.select();
                    sendJson(res, 200, allRows);
                    break;

                case 'POST':
                    // Добавить новую строку
                    const newRow = await parseBody(req);
                    if (!newRow.name || !newRow.bday) {
                        sendJson(res, 400, { error: 'Требуются поля: name, bday' });
                        return;
                    }
                    const insertedRow = await db.insert(newRow);
                    sendJson(res, 201, insertedRow);
                    break;

                case 'PUT':
                    // Изменить существующую строку
                    const updateRow = await parseBody(req);
                    if (!updateRow.id || !updateRow.name || !updateRow.bday) {
                        sendJson(res, 400, { error: 'Требуются поля: id, name, bday' });
                        return;
                    }
                    const updatedRow = await db.update(updateRow);
                    sendJson(res, 200, updatedRow);
                    break;

                case 'DELETE':
                    // Удалить строку по id
                    const id = parseInt(parsedUrl.query.id);
                    if (!id) {
                        sendJson(res, 400, { error: 'Требуется параметр id в query-строке' });
                        return;
                    }
                    const deletedRow = await db.delete(id);
                    sendJson(res, 200, deletedRow);
                    break;

                case 'COMMIT':
                    const commit = await db.commit();
                    sendJson(res, 200, commit);
                    break;


                default:
                    sendJson(res, 405, { error: 'Метод не поддерживается' });
            }
        }
        catch (error) {
            console.error('Ошибка:', error.message);
            statusCode = error.message.includes('не найдена') ? 404 : 500;
            sendJson(res, statusCode, { error: error.message });
        }
    }

    if (path === '/api/ss') {
        if (stats.collecting) {
        stats.request += 1;
    }
        if (method !== 'GET') {
            sendJson(res, 405, { error: 'Метод не поддерживается' });
            return;
        }

        const payload = {
            start: stats.start ? formatDateTime(stats.start) : '',
            finish: stats.collecting ? '' : (stats.finish ? formatDateTime(stats.finish) : ''),
            request: stats.request,
            commit: stats.commit
        };

        sendJson(res, 200, payload);
        return;
    }

});

const PORT = 5000;
server.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}/api/db`);
    console.log('Ожидание запросов...');
});