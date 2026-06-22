const http = require('http');
const fs = require('fs');

const options = {
  hostname: 'localhost',
  port: 3008,
  path: '/download',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log('Статус ответа:', res.statusCode);
  console.log('Content-Type:', res.headers['content-type']);
  console.log('Content-Disposition:', res.headers['content-disposition']);
  
  const filename = (res.headers['content-disposition']?.split('filename=')[1] || 'downloaded_file').replace(/"/g, '');
  const fileStream = fs.createWriteStream(`./received_${filename}`);
  
  res.pipe(fileStream);
  
  fileStream.on('finish', () => {
    console.log('Файл успешно сохранен');
    fileStream.close();
  });
});

req.end();