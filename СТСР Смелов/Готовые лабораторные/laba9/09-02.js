const http = require('http');

const x = 15;
const y = 25;
const path = `/?x=${x}&y=${y}`;

const options = {
  hostname: 'localhost',
  port: 3002,
  path: path,
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log('Статус ответа:', res.statusCode);
  
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log('Данные в теле ответа:', data);
  });
});

req.end();