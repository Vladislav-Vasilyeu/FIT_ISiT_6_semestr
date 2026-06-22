const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;

if (!uri) {
    console.error('MONGODB_URI is not set. Check your .env file.');
    process.exit(1);
}

async function run() {
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('Подключение к MongoDB Atlas успешно');

        const database = client.db('BSTU');

        const faculties = database.collection('faculty');
        const pulpits = database.collection('pulpit');

        await faculties.deleteMany({});
        await pulpits.deleteMany({});

        await faculties.insertMany([
            {
                faculty: 'ИТ',
                faculty_name: 'Информационных технологий'
            },
            {
                faculty: 'ИЭ',
                faculty_name: 'Инженерно-экономический'
            },
            {
                faculty: 'ЛХФ',
                faculty_name: 'Лесохозяйственный факультет'
            }
        ]);

        await pulpits.insertMany([
            {
                pulpit: 'ИСиТ',
                pulpit_name: 'Информационных систем и технологий',
                faculty: 'ИТ'
            },
            {
                pulpit: 'ПИ',
                pulpit_name: 'Программной инженерии',
                faculty: 'ИТ'
            },
            {
                pulpit: 'ЭТиМ',
                pulpit_name: 'Экономической теории и маркетинга',
                faculty: 'ИЭ'
            },
            {
                pulpit: 'ЛКиП',
                pulpit_name: 'Лесных культур и почвоведения',
                faculty: 'ЛХФ'
            }
        ]);

        console.log('Коллекции faculty и pulpit успешно заполнены');
    } catch (error) {
        console.error('Ошибка:', error);
    } finally {
        await client.close();
        console.log('Подключение закрыто');
    }
}

run();
