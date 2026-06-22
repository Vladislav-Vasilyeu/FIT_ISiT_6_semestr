const http = require('http');
const fs = require('fs/promises');
const path = require('path');
const { sequelize } = require('./src/db');
const { models } = require('./src/models');

const port = process.env.PORT || 3000;
const indexPath = path.join(__dirname, 'public', 'index.html');

const routes = new Map();

function routeKey(method, routePath) {
  return `${method.toUpperCase()} ${routePath}`;
}

function addRoute(method, routePath, handler) {
  routes.set(routeKey(method, routePath), handler);
}

function send(res, statusCode, data, contentType = 'application/json; charset=utf-8') {
  const body = typeof data === 'string' ? data : JSON.stringify(data);

  res.writeHead(statusCode, {
    'Content-Type': contentType,
    'Content-Length': Buffer.byteLength(body)
  });
  res.end(body);
}

function sendJson(res, statusCode, data) {
  send(res, statusCode, data);
}

async function readJsonBody(req) {
  const chunks = [];

  for await (const chunk of req) {
    chunks.push(chunk);
  }

  const rawBody = Buffer.concat(chunks).toString('utf8').trim();
  if (!rawBody) {
    return {};
  }

  try {
    return JSON.parse(rawBody);
  } catch (err) {
    err.statusCode = 400;
    err.message = 'Invalid JSON body';
    throw err;
  }
}

function getErrorStatus(err) {
  if (err.statusCode) {
    return err.statusCode;
  }

  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    return 400;
  }

  return 500;
}

function formatError(err) {
  return {
    error: err.message,
    details: err.errors ? err.errors.map((item) => item.message) : undefined
  };
}

function createCrudRoutes(pathName, model, primaryKey) {
  addRoute('GET', `/api/${pathName}`, async (req, res) => {
    const rows = await model.findAll();
    sendJson(res, 200, rows);
  });

  addRoute('POST', `/api/${pathName}`, async (req, res) => {
    const row = await model.create(req.body);
    sendJson(res, 201, row);
  });

  addRoute('PUT', `/api/${pathName}`, async (req, res) => {
    const keyValue = req.body[primaryKey];
    if (!keyValue) {
      sendJson(res, 400, { error: `Field ${primaryKey} is required` });
      return;
    }

    const row = await model.findByPk(keyValue);
    if (!row) {
      sendJson(res, 404, { error: 'Record not found' });
      return;
    }

    await row.update(req.body);
    sendJson(res, 200, row);
  });

  addRoute('DELETE', `/api/${pathName}/:id`, async (req, res) => {
    const row = await model.findByPk(req.params.id);
    if (!row) {
      sendJson(res, 404, { error: 'Record not found' });
      return;
    }

    const deleted = row.toJSON();
    await row.destroy();
    sendJson(res, 200, deleted);
  });
}

function matchRoute(method, pathname) {
  const direct = routes.get(routeKey(method, pathname));
  if (direct) {
    return { handler: direct, params: {} };
  }

  const deletePrefix = pathname.substring(0, pathname.lastIndexOf('/'));
  const deleteHandler = routes.get(routeKey(method, `${deletePrefix}/:id`));
  if (deleteHandler) {
    const id = pathname.substring(pathname.lastIndexOf('/') + 1);
    return { handler: deleteHandler, params: { id: decodeURIComponent(id) } };
  }

  return null;
}

async function serveIndex(res) {
  const html = await fs.readFile(indexPath, 'utf8');
  send(res, 200, html, 'text/html; charset=utf-8');
}

createCrudRoutes('faculties', models.Faculty, 'FACULTY');
createCrudRoutes('pulpits', models.Pulpit, 'PULPIT');
createCrudRoutes('subjects', models.Subject, 'SUBJECT');
createCrudRoutes('auditoriumstypes', models.AuditoriumType, 'AUDITORIUM_TYPE');
createCrudRoutes('auditoriumtypes', models.AuditoriumType, 'AUDITORIUM_TYPE');
createCrudRoutes('auditoriums', models.Auditorium, 'AUDITORIUM');
createCrudRoutes('auditorims', models.Auditorium, 'AUDITORIUM');

addRoute('PUT', '/auditorims', async (req, res) => {
  const row = await models.Auditorium.findByPk(req.body.AUDITORIUM);
  if (!row) {
    sendJson(res, 404, { error: 'Record not found' });
    return;
  }

  await row.update(req.body);
  sendJson(res, 200, row);
});

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = url.pathname;
    const method = req.method.toUpperCase();

    if (method === 'GET' && pathname === '/') {
      await serveIndex(res);
      return;
    }

    const matchedRoute = matchRoute(method, pathname);
    if (!matchedRoute) {
      sendJson(res, 404, { error: 'Route not found' });
      return;
    }

    req.params = matchedRoute.params;
    req.body = method === 'POST' || method === 'PUT' ? await readJsonBody(req) : {};

    await matchedRoute.handler(req, res);
  } catch (err) {
    sendJson(res, getErrorStatus(err), formatError(err));
  }
});

server.listen(port, () => {
  console.log(`Server is listening on http://localhost:${port}`);

  sequelize.authenticate()
    .then(() => console.log('Database connection has been established successfully.'))
    .catch((err) => {
      console.warn('Database connection is not available yet:', err.message);
    });
});
