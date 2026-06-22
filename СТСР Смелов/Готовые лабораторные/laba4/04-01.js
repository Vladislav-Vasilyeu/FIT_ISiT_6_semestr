const http = require('http');
const url = require('url');
const DB = require('./DB');

const db = new DB();

// Подписка на события для логирования
db.on('GET', (data) => console.log(`[GET] Получено ${data.length} записей`));
db.on('POST', (row) => console.log(`[POST] Добавлена запись:`, row));
db.on('PUT', (row) => console.log(`[PUT] Обновлена запись:`, row));
db.on('DELETE', (row) => console.log(`[DELETE] Удалена запись:`, row));

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
        'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;
    const method = req.method;

    // CORS preflight
    if (method === 'OPTIONS') {
        res.writeHead(200, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        });
        res.end();
        return;
    }

    // Проверяем маршрут /api/db
    if (path !== '/api/db') {
        sendJson(res, 404, { error: 'Маршрут не найден' });
        return;
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

            default:
                sendJson(res, 405, { error: 'Метод не поддерживается' });
        }
    } catch (error) {
        console.error('Ошибка:', error.message);
        const statusCode = error.message.includes('не найдена') ? 404 : 500;
        sendJson(res, statusCode, { error: error.message });
    }
});

const PORT = 5000;
server.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}/api/db`);
    console.log('Ожидание запросов...');
});