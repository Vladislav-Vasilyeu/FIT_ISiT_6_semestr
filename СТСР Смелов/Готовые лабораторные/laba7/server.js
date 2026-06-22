const http = require('http');
const fs = require('fs');
const path = require('path');
const { createStaticHandler } = require('./m07-01');

const staticRootDir = process.env.STATIC_ROOT || './static';
const port = process.env.PORT || 3000;


const handler = createStaticHandler(staticRootDir);

const server = http.createServer(handler);

server.listen(port, () => {
  console.log(`Server 07-01 started on http://localhost:${port}`);
  console.log(`Static root: ${path.resolve(staticRootDir)}`);
});

server.on('error', (err) => {
  console.error('Server error', err);
});
