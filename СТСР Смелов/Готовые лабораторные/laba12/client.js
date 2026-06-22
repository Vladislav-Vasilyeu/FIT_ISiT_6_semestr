const EventSource = require('eventsource');

const url = 'http://localhost:3000/subscribe';
const es = new EventSource(url);

es.onopen = () => {
    console.log('✅ Подключен к серверу уведомлений');
};

es.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log('\n🔔 УВЕДОМЛЕНИЕ:');
    console.log(JSON.stringify(data, null, 2));
    console.log('---');
};

es.onerror = (err) => {
    console.error('❌ Ошибка подключения:', err.message);
};

console.log(`Подключение к ${url}...`);