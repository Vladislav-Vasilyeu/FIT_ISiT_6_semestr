const http = require('http');
const querystring = require('querystring');

const postData = querystring.stringify({
  x: 10,
  y: 20,
  s: 'Привет от клиента'
});

const options = {
  hostname: 'localhost',
  port: 3003,
  path: '/',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  console.log('Статус ответа:', res.statusCode);
  
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log('Данные в теле ответа:', data);
  });
});

req.write(postData);
req.end();