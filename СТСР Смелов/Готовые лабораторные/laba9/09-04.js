const http = require('http');

const data = {
  id: 1,
  name: 'Тестовый объект',
  values: [1, 2, 3, 4, 5]
};

const postData = JSON.stringify(data);

const options = {
  hostname: 'localhost',
  port: 3004,
  path: '/api/data',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  console.log('Статус ответа:', res.statusCode);
  
  let responseData = '';
  res.on('data', (chunk) => responseData += chunk);
  res.on('end', () => {
    console.log('Ответ сервера:', responseData);
    const parsed = JSON.parse(responseData);
    console.log('Обработанный JSON:', parsed);
  });
});

req.write(postData);
req.end();