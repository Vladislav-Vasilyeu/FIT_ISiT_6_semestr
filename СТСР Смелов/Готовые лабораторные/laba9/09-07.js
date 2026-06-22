const FormData = require('form-data');
const fs = require('fs');
const http = require('http');

const form = new FormData();
form.append('image', fs.createReadStream('./files/Myfile.png'), {
  filename: 'MyFile.png',
  contentType: 'image/png'
});

const options = {
  hostname: 'localhost',
  port: 3007,
  path: '/upload-image',
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

// Прогресс загрузки
const fileSize = fs.statSync('./files/MyFile.png').size;
let uploaded = 0;

form.on('data', (chunk) => {
  uploaded += chunk.length;
  const percent = (uploaded / fileSize * 100).toFixed(2);
  console.log(`Загрузка: ${percent}%`);
});