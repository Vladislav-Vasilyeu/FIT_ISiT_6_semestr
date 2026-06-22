const http = require('http');
const fs = require('fs').promises;
const path = require('path');
const url = require('url');

const PORT = 3000;
const STUDENTS_FILE = path.join(__dirname, 'StudentList.json');

// Хранилище для SSE клиентов
const clients = [];

// Инициализация файла со студентами
async function initFile() {
    try {
        await fs.access(STUDENTS_FILE);
    } catch {
        await fs.writeFile(STUDENTS_FILE, JSON.stringify([
            { "id": 1, "name": "Иванов И. И.", "bday": "2000-12-02", "specility": "ПОИТ" },
            { "id": 2, "name": "Петров П. П.", "bday": "2001-11-01", "specility": "ИСиТ" },
            { "id": 3, "name": "Сидорова С. С.", "bday": "2001-11-01", "specility": "ДЭВИ" }
        ], null, 2));
    }
}

// Отправка уведомлений всем подписанным клиентам
function notifyAll(message) {
    clients.forEach(client => {
        client.write(`data: ${JSON.stringify(message)}\n\n`);
    });
}

// ============= ОБРАБОТЧИКИ =============

// 1. GET / - получить всех студентов
async function getAll(res) {
    const data = await fs.readFile(STUDENTS_FILE, 'utf8');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(data);
}

// 2. GET /n - получить студента по id
async function getById(res, id) {
    const data = await fs.readFile(STUDENTS_FILE, 'utf8');
    const students = JSON.parse(data);
    const student = students.find(s => s.id === parseInt(id));
    
    if (!student) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 2, message: `студент с id равным ${id} не найден` }));
    }
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(student));
}

// 3. POST / - добавить студента
async function addStudent(res, body) {
    const data = await fs.readFile(STUDENTS_FILE, 'utf8');
    const students = JSON.parse(data);
    const newStudent = JSON.parse(body);
    
    if (students.find(s => s.id === newStudent.id)) {
        res.writeHead(409, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 3, message: `студент с id равным ${newStudent.id} уже есть` }));
    }
    
    students.push(newStudent);
    await fs.writeFile(STUDENTS_FILE, JSON.stringify(students, null, 2));
    
    // Уведомление об изменении
    notifyAll({ event: 'student_changed', action: 'add', student: newStudent });
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(newStudent));
}

// 4. PUT / - обновить студента
async function updateStudent(res, body) {
    const data = await fs.readFile(STUDENTS_FILE, 'utf8');
    const students = JSON.parse(data);
    const updatedStudent = JSON.parse(body);
    const index = students.findIndex(s => s.id === updatedStudent.id);
    
    if (index === -1) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 2, message: `студент с id равным ${updatedStudent.id} не найден` }));
    }
    
    students[index] = updatedStudent;
    await fs.writeFile(STUDENTS_FILE, JSON.stringify(students, null, 2));
    
    // Уведомление об изменении
    notifyAll({ event: 'student_changed', action: 'update', student: updatedStudent });
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(updatedStudent));
}

// 5. DELETE /n - удалить студента
async function deleteStudent(res, id) {
    const data = await fs.readFile(STUDENTS_FILE, 'utf8');
    const students = JSON.parse(data);
    const student = students.find(s => s.id === parseInt(id));
    
    if (!student) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 2, message: `студент с id равным ${id} не найден` }));
    }
    
    const newStudents = students.filter(s => s.id !== parseInt(id));
    await fs.writeFile(STUDENTS_FILE, JSON.stringify(newStudents, null, 2));
    
    // Уведомление об изменении
    notifyAll({ event: 'student_changed', action: 'delete', student: student });
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(student));
}

// 6. POST /backup - создать копию с задержкой 2 сек
async function createBackup(res) {
    const now = new Date();
    const YYYY = now.getFullYear();
    const MM = String(now.getMonth() + 1).padStart(2, '0');
    const DD = String(now.getDate()).padStart(2, '0');
    const HH = String(now.getHours()).padStart(2, '0');
    const SS = String(now.getMinutes()).padStart(2, '0');
    const backupName = `${YYYY}${MM}${DD}${HH}${SS}_StudentList.json`;
    
    setTimeout(async () => {
        await fs.copyFile(STUDENTS_FILE, path.join(__dirname, backupName));
        notifyAll({ event: 'backup_created', file: backupName });
        console.log(`Создан бэкап: ${backupName}`);
    }, 2000);
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'копирование начато, будет готово через 2 секунды' }));
}

// 7. GET /backup - получить список всех копий
async function getBackups(res) {
    const files = await fs.readdir(__dirname);
    const backups = files.filter(f => f.endsWith('_StudentList.json'));
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ backups: backups }));
}

// 8. DELETE /backup/yyyyddmm - удалить копии старше даты
async function deleteOldBackups(res, dateStr) {
    if (!/^[0-9]{8}$/.test(dateStr)) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 4, message: 'Неправильный формат даты. Ожидается YYYYMMDD' }));
    }

    const files = await fs.readdir(__dirname);
    const backups = files.filter(f => f.endsWith('_StudentList.json'));
    const deleted = [];

    for (const backup of backups) {
        const backupDate = backup.substring(0, 8);
        if (backupDate < dateStr) {
            await fs.unlink(path.join(__dirname, backup));
            deleted.push(backup);
        }
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: `удалено ${deleted.length} копий`, deleted }));
}

// 9. DELETE /backup/<filename> - удалить конкретный бэкап
async function deleteBackupFile(res, backupName) {
    if (!backupName.endsWith('_StudentList.json')) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 4, message: 'Имя файла должно заканчиваться на _StudentList.json' }));
    }

    const filePath = path.join(__dirname, backupName);
    try {
        await fs.access(filePath);
    } catch {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 2, message: `бэкап ${backupName} не найден` }));
    }

    await fs.unlink(filePath);
    
    notifyAll({ event: 'backup_deleted', action: 'delete', student: newStudent });

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: `удален бэкап ${backupName}`, deleted: [backupName] }));
}

// 10. DELETE /backup?all=true - удалить все копии
async function deleteAllBackups(res) {
    const files = await fs.readdir(__dirname);
    const backups = files.filter(f => f.endsWith('_StudentList.json'));
    const deleted = [];

    for (const backup of backups) {
        await fs.unlink(path.join(__dirname, backup));
        deleted.push(backup);
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: `удалено ${deleted.length} копий`, deleted }));
}

// 11. GET /subscribe - подписка на уведомления (SSE)
function subscribe(res) {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });
    
    clients.push(res);
    console.log(`Клиент подключен. Всего клиентов: ${clients.length}`);
    
    // Отправляем приветственное сообщение
    res.write(`data: ${JSON.stringify({ event: 'connected', message: 'Вы подписаны на уведомления' })}\n\n`);
}

// ============= ГЛАВНЫЙ СЕРВЕР =============
const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const method = req.method;
    
    console.log(`${method} ${pathname}`);
    
    // CORS для удобства тестирования
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (method === 'OPTIONS') {
        res.writeHead(200);
        return res.end();
    }
    
    try {
        // GET /subscribe - подписка
        if (method === 'GET' && pathname === '/subscribe') {
            return subscribe(res);
        }
        
        // GET / - все студенты
        if (method === 'GET' && pathname === '/') {
            return await getAll(res);
        }
        
        // GET /n - студент по id
        if (method === 'GET' && /^\/\d+$/.test(pathname)) {
            const id = pathname.slice(1);
            return await getById(res, id);
        }
        
        // POST / - добавить студента
        if (method === 'POST' && pathname === '/') {
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', async () => await addStudent(res, body));
            return;
        }
        
        // PUT / - обновить студента
        if (method === 'PUT' && pathname === '/') {
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', async () => await updateStudent(res, body));
            return;
        }
        
        // DELETE /n - удалить студента
        if (method === 'DELETE' && /^\/\d+$/.test(pathname)) {
            const id = pathname.slice(1);
            return await deleteStudent(res, id);
        }
        
        // POST /backup - создать копию
        if (method === 'POST' && pathname === '/backup') {
            return await createBackup(res);
        }
        
        // GET /backup - список копий
        if (method === 'GET' && pathname === '/backup') {
            return await getBackups(res);
        }

        // DELETE /backup?all=true - удалить все копии
        if (method === 'DELETE' && pathname === '/backup' && parsedUrl.query.all === 'true') {
            return await deleteAllBackups(res);
        }
        
        // DELETE /backup/yyyyMMdd - удалить копии старше даты
        if (method === 'DELETE' && /^\/backup\/\d{8}$/.test(pathname)) {
            const dateStr = pathname.split('/')[2];
            return await deleteOldBackups(res, dateStr);
        }

        // DELETE /backup/<filename> - удалить конкретный бэкап
        if (method === 'DELETE' && /^\/backup\/.+_StudentList\.json$/.test(pathname)) {
            const backupName = decodeURIComponent(pathname.split('/').slice(2).join('/'));
            return await deleteBackupFile(res, backupName);
        }
        
        // 404
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 404, message: 'Маршрут не найден' }));
        
    } catch (err) {
        console.error(err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 500, message: 'Ошибка сервера' }));
    }
});

// Запуск
initFile().then(() => {
    server.listen(PORT, () => {
        console.log(`\n✅ Сервер запущен на http://localhost:${PORT}`);
        console.log('\nДоступные маршруты:');
        console.log('  GET    /                      - получить всех студентов');
        console.log('  GET    /1                     - получить студента id=1');
        console.log('  POST   /                      - добавить студента');
        console.log('  PUT    /                      - обновить студента');
        console.log('  DELETE /1                     - удалить студента id=1');
        console.log('  POST   /backup                - создать копию (задержка 2с)');
        console.log('  GET    /backup                - список копий');
        console.log('  DELETE /backup/20251201       - удалить копии старше 2025-12-01');
        console.log('  DELETE /backup?all=true       - удалить все копии');
        console.log('  DELETE /backup/<file_name>    - удалить конкретный бэкап');
        console.log('  GET    /subscribe             - подписка на уведомления (SSE)\n');
    });
});