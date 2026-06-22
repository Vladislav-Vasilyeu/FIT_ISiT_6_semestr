const http = require('http');
const { createHandler } = require('graphql-http/lib/use/http');
const schema = require('./schema');
const rootValue = require('./resolvers');
require('dotenv').config();

const port = Number(process.env.PORT || 3000);
const graphqlHandler = createHandler({
  schema,
  rootValue
});

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === '/') {
    res.writeHead(302, { Location: '/graphql' });
    res.end();
    return;
  }

  if (url.pathname === '/graphql') {
    graphqlHandler(req, res);
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Not found');
});

server.listen(port, () => {
  console.log(`GraphQL server is running at http://localhost:${port}/graphql`);
});
