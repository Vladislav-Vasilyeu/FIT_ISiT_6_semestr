const FormData = require('form-data');
const fs = require('fs');
const http = require('http');

const form = new FormData();
form.append('file', fs.createReadStream('./files/MyFile.txt'), {
  filename: 'MyFile.txt',
  contentType: 'text/plain'
});
form.append('description', 'Текстовый файл для задания 06');

const options = {
  hostname: 'localhost',
  port: 3006,
  path: '/upload',
  method: 'POST',
  headers: form.getHeaders()
};

const req = http.request(options, (res) => {
  console.log('Статус ответа:', res.statusCode);
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => console.log('Ответ:', data));
});

form.pipe(req);