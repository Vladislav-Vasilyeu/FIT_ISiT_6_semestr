const http = require('http');
const xml2js = require('xml2js');

const builder = new xml2js.Builder();
const requestObj = {
  request: {
    id: 100,
    operation: 'calculate',
    params: {
      a: 5,
      b: 3
    }
  }
};

const xmlData = builder.buildObject(requestObj);

const options = {
  hostname: 'localhost',
  port: 3005,
  path: '/api/xml',
  method: 'POST',
  headers: {
    'Content-Type': 'application/xml',
    'Content-Length': Buffer.byteLength(xmlData)
  }
};

const req = http.request(options, (res) => {
  console.log('Статус ответа:', res.statusCode);
  
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', async () => {
    console.log('XML ответ:', data);
    
    // Парсим XML ответ
    const parser = new xml2js.Parser();
    try {
      const result = await parser.parseStringPromise(data);
      console.log('Распарсенный ответ:', JSON.stringify(result, null, 2));
    } catch (e) {
      console.error('Ошибка парсинга:', e);
    }
  });
});

req.write(xmlData);
req.end();