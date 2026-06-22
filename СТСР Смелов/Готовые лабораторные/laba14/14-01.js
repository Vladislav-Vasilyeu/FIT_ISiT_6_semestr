 const http = require('http');
const fs = require('fs');
const path = require('path');
const sql = require('mssql');

// ====================== НАСТРОЙКИ ======================
const PORT = 3000;
const DB_NAME = 'VVV';   

const dbConfig = {
    user: 'sa',
    password: 'Vlad060606',
    server: 'Server',
    database: DB_NAME,
    options: {
        encrypt: false,
        trustServerCertificate: true
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

// Подключение пула
const pool = new sql.ConnectionPool(dbConfig);
pool.connect().then(() => {
    console.log(`✅ Подключено к БД: ${DB_NAME}`);
}).catch(err => console.error('❌ Ошибка БД:', err));

// ====================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ======================
const sendJson = (res, status, data) => {
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(data));
};

const parseBody = (req) => new Promise(resolve => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
        try { resolve(JSON.parse(body)); }
        catch { resolve({}); }
    });
});

const request = () => pool.request();

// ====================== СЕРВЕР ======================
const server = http.createServer(async (req, res) => {
    const url = req.url;
    const method = req.method;
    const pathname = url.split('?')[0];

    try {
        // Главная страница
        if (method === 'GET' && pathname === '/') {
            fs.readFile(path.join(__dirname, 'index.html'), (err, data) => {
                if (err) {
                    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
                    return res.end('404 Not Found');
                }
                res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(data);
            });
            return;
        }

        // Стили
        if (method === 'GET' && pathname === '/style.css') {
            fs.readFile(path.join(__dirname, 'style.css'), (err, data) => {
                if (err) {
                    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
                    return res.end('404 Not Found');
                }
                res.writeHead(200, { 'Content-Type': 'text/css; charset=utf-8' });
                res.end(data);
            });
            return;
        }

        // ========== GET ==========
        if (method === 'GET' && url.startsWith('/api/')) {
            let query = '';

            switch (url) {
                case '/api/faculties':      query = 'SELECT * FROM FACULTY'; break;
                case '/api/pulpits':        query = 'SELECT * FROM PULPIT'; break;
                case '/api/subjects':       query = 'SELECT * FROM SUBJECT'; break;
                case '/api/auditoriumstypes': query = 'SELECT * FROM AUDITORIUM_TYPE'; break;
                case '/api/auditoriums':    query = 'SELECT * FROM AUDITORIUM'; break;
                default:
                    sendJson(res, 404, { error: 'Not found' });
                    return;
            }

            const result = await request().query(query);
            sendJson(res, 200, result.recordset);
            return;
        }

        // ========== POST ==========
        if (method === 'POST' && url.startsWith('/api/')) {
            const body = await parseBody(req);

            if (url === '/api/faculties') {
                await request()
                    .input('FACULTY', sql.VarChar(10), body.FACULTY)
                    .input('FACULTY_NAME', sql.VarChar(50), body.FACULTY_NAME)
                    .query('INSERT INTO FACULTY VALUES (@FACULTY, @FACULTY_NAME)');
                sendJson(res, 200, body);
                return;
            }

            if (url === '/api/pulpits') {
                await request()
                    .input('PULPIT', sql.VarChar(10), body.PULPIT)
                    .input('PULPIT_NAME', sql.VarChar(50), body.PULPIT_NAME)
                    .input('FACULTY', sql.VarChar(10), body.FACULTY)
                    .query('INSERT INTO PULPIT VALUES (@PULPIT, @PULPIT_NAME, @FACULTY)');
                sendJson(res, 200, body);
                return;
            }

            if (url === '/api/subjects') {
                await request()
                    .input('SUBJECT', sql.VarChar(10), body.SUBJECT)
                    .input('SUBJECT_NAME', sql.VarChar(100), body.SUBJECT_NAME)
                    .input('PULPIT', sql.VarChar(10), body.PULPIT)
                    .query('INSERT INTO SUBJECT VALUES (@SUBJECT, @SUBJECT_NAME, @PULPIT)');
                sendJson(res, 200, body);
                return;
            }

            if (url === '/api/auditoriumstypes') {
                await request()
                    .input('AUDITORIUM_TYPE', sql.VarChar(10), body.AUDITORIUM_TYPE)
                    .input('AUDITORIUM_TYPENAME', sql.VarChar(50), body.AUDITORIUM_TYPENAME)
                    .query('INSERT INTO AUDITORIUM_TYPE VALUES (@AUDITORIUM_TYPE, @AUDITORIUM_TYPENAME)');
                sendJson(res, 200, body);
                return;
            }

            if (url === '/api/auditoriums') {
                await request()
                    .input('AUDITORIUM', sql.VarChar(10), body.AUDITORIUM)
                    .input('AUDITORIUM_NAME', sql.VarChar(50), body.AUDITORIUM_NAME)
                    .input('AUDITORIUM_CAPACITY', sql.Int, body.AUDITORIUM_CAPACITY)
                    .input('AUDITORIUM_TYPE', sql.VarChar(10), body.AUDITORIUM_TYPE)
                    .query('INSERT INTO AUDITORIUM VALUES (@AUDITORIUM, @AUDITORIUM_NAME, @AUDITORIUM_CAPACITY, @AUDITORIUM_TYPE)');
                sendJson(res, 200, body);
                return;
            }
        }

        // ========== PUT ==========
        if (method === 'PUT' && url.startsWith('/api/')) {
            const body = await parseBody(req);

            if (url === '/api/faculties') {
                await request()
                    .input('FACULTY', sql.VarChar(10), body.FACULTY)
                    .input('FACULTY_NAME', sql.VarChar(50), body.FACULTY_NAME)
                    .query('UPDATE FACULTY SET FACULTY_NAME = @FACULTY_NAME WHERE FACULTY = @FACULTY');
                sendJson(res, 200, body);
                return;
            }

            if (url === '/api/pulpits') {
                await request()
                    .input('PULPIT', sql.VarChar(10), body.PULPIT)
                    .input('PULPIT_NAME', sql.VarChar(50), body.PULPIT_NAME)
                    .input('FACULTY', sql.VarChar(10), body.FACULTY)
                    .query('UPDATE PULPIT SET PULPIT_NAME = @PULPIT_NAME, FACULTY = @FACULTY WHERE PULPIT = @PULPIT');
                sendJson(res, 200, body);
                return;
            }

            if (url === '/api/subjects') {
                await request()
                    .input('SUBJECT', sql.VarChar(10), body.SUBJECT)
                    .input('SUBJECT_NAME', sql.VarChar(100), body.SUBJECT_NAME)
                    .input('PULPIT', sql.VarChar(10), body.PULPIT)
                    .query('UPDATE SUBJECT SET SUBJECT_NAME = @SUBJECT_NAME, PULPIT = @PULPIT WHERE SUBJECT = @SUBJECT');
                sendJson(res, 200, body);
                return;
            }

            if (url === '/api/auditoriumstypes') {
                await request()
                    .input('AUDITORIUM_TYPE', sql.VarChar(10), body.AUDITORIUM_TYPE)
                    .input('AUDITORIUM_TYPENAME', sql.VarChar(50), body.AUDITORIUM_TYPENAME)
                    .query('UPDATE AUDITORIUM_TYPE SET AUDITORIUM_TYPENAME = @AUDITORIUM_TYPENAME WHERE AUDITORIUM_TYPE = @AUDITORIUM_TYPE');
                sendJson(res, 200, body);
                return;
            }

            if (url === '/api/auditoriums') {
                await request()
                    .input('AUDITORIUM', sql.VarChar(10), body.AUDITORIUM)
                    .input('AUDITORIUM_NAME', sql.VarChar(50), body.AUDITORIUM_NAME)
                    .input('AUDITORIUM_CAPACITY', sql.Int, body.AUDITORIUM_CAPACITY)
                    .input('AUDITORIUM_TYPE', sql.VarChar(10), body.AUDITORIUM_TYPE)
                    .query('UPDATE AUDITORIUM SET AUDITORIUM_NAME = @AUDITORIUM_NAME, AUDITORIUM_CAPACITY = @AUDITORIUM_CAPACITY, AUDITORIUM_TYPE = @AUDITORIUM_TYPE WHERE AUDITORIUM = @AUDITORIUM');
                sendJson(res, 200, body);
                return;
            }
        }

        // ========== DELETE ==========
        if (method === 'DELETE' && url.startsWith('/api/')) {
            const parts = url.split('/');
            const id = decodeURIComponent(parts[parts.length - 1]);
            const entity = parts[parts.length - 2];

            let table = '', key = '';

            switch (entity) {
                case 'faculties': table = 'FACULTY'; key = 'FACULTY'; break;
                case 'pulpits': table = 'PULPIT'; key = 'PULPIT'; break;
                case 'subjects': table = 'SUBJECT'; key = 'SUBJECT'; break;
                case 'auditoriumstypes': table = 'AUDITORIUM_TYPE'; key = 'AUDITORIUM_TYPE'; break;
                case 'auditoriums': table = 'AUDITORIUM'; key = 'AUDITORIUM'; break;
            }

            if (table) {
                await request()
                    .input('id', sql.NVarChar, id)
                    .query(`DELETE FROM ${table} WHERE ${key} = @id`);
                sendJson(res, 200, { message: 'Удалено', id });
                return;
            }
        }

        sendJson(res, 404, { error: 'Route not found' });

    } catch (err) {
        console.error(err);
        sendJson(res, 500, { error: err.message });
    }
});

server.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
});