const http = require('http');
const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');

dotenv.config();

const PORT = 3000;
const uri = process.env.MONGODB_URI;

if (!uri) {
    console.error('MONGODB_URI is not set. Check your .env file.');
    process.exit(1);
}

const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 60000,
    connectTimeoutMS: 60000,
    socketTimeoutMS: 60000
});
let db;

// Подключение к MongoDB
async function connectDB() {
    try {
        await client.connect();
        db = client.db('BSTU');
        console.log('✅ Успешное подключение к MongoDB (BSTU)');
    } catch (err) {
        console.error('❌ Ошибка подключения:', err);
        process.exit(1);
    }
}

// Вспомогательная функция для отправки JSON-ответа
function sendJson(res, status, data) {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
}

// Парсинг тела запроса
async function getBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch (e) {
                reject(new Error('Invalid JSON'));
            }
        });
    });
}

// Основной обработчик
const server = http.createServer(async (req, res) => {
    const url = req.url;
    const method = req.method;

    try {
        // ====================== FACULTIES ======================
        if (url === '/api/faculties') {
            if (method === 'GET') {
                const faculties = await db.collection('faculty').find({}).toArray();
                return sendJson(res, 200, faculties);
            }

            if (method === 'POST') {
                const body = await getBody(req);
                const result = await db.collection('faculty').insertOne(body);
                return sendJson(res, 201, { ...body, _id: result.insertedId });
            }

            if (method === 'PUT') {
                const body = await getBody(req);
                const { faculty, ...updateData } = body;
                const result = await db.collection('faculty').updateOne(
                    { faculty },
                    { $set: updateData }
                );
                if (result.matchedCount === 0) {
                    return sendJson(res, 404, { error: "Faculty not found" });
                }
                return sendJson(res, 200, { message: "Updated", ...body });
            }
        }

        // DELETE /api/faculties/ФИТ
        if (url.startsWith('/api/faculties/') && method === 'DELETE') {
            const facultyCode = url.split('/').pop();
            const result = await db.collection('faculty').deleteOne({ faculty: facultyCode });
            if (result.deletedCount === 0) {
                return sendJson(res, 404, { error: "Faculty not found" });
            }
            return sendJson(res, 200, { message: "Deleted", faculty: facultyCode });
        }

        // ====================== PULPITS ======================
        if (url === '/api/pulpits') {
            if (method === 'GET') {
                const pulpits = await db.collection('pulpit').find({}).toArray();
                return sendJson(res, 200, pulpits);
            }

            if (method === 'POST') {
                const body = await getBody(req);
                const result = await db.collection('pulpit').insertOne(body);
                return sendJson(res, 201, { ...body, _id: result.insertedId });
            }

            if (method === 'PUT') {
                const body = await getBody(req);
                const { pulpit, ...updateData } = body;
                const result = await db.collection('pulpit').updateOne(
                    { pulpit },
                    { $set: updateData }
                );
                if (result.matchedCount === 0) {
                    return sendJson(res, 404, { error: "Pulpit not found" });
                }
                return sendJson(res, 200, { message: "Updated", ...body });
            }
        }

        // DELETE /api/pulpits/ПИ
        if (url.startsWith('/api/pulpits/') && method === 'DELETE') {
            const pulpitCode = url.split('/').pop();
            const result = await db.collection('pulpit').deleteOne({ pulpit: pulpitCode });
            if (result.deletedCount === 0) {
                return sendJson(res, 404, { error: "Pulpit not found" });
            }
            return sendJson(res, 200, { message: "Deleted", pulpit: pulpitCode });
        }

        // Если маршрут не найден
        sendJson(res, 404, { error: "Route not found" });

    } catch (err) {
        console.error(err);
        sendJson(res, 500, { error: err.message });
    }
});

// Запуск
connectDB().then(() => {
    server.listen(PORT, () => {
        console.log(`🚀 Сервер запущен: http://localhost:${PORT}`);
    });
});
