const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log('Статус ответа:', res.statusCode);
  console.log('Сообщение к статусу:', res.statusMessage);
  console.log('IP-адрес сервера:', res.socket.remoteAddress);
  console.log('Порт сервера:', res.socket.remotePort);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Данные в теле ответа:', data);
  });
});

req.on('error', (e) => {
  console.error(`Ошибка: ${e.message}`);
});

req.end();