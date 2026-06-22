const http = require('node:http');

const PORT = Number(process.env.PORT) || 3000;

const JsonRpcError = {
  PARSE_ERROR: { code: -32700, message: 'Parse error' },
  INVALID_REQUEST: { code: -32600, message: 'Invalid Request' },
  METHOD_NOT_FOUND: { code: -32601, message: 'Method not found' },
  INVALID_PARAMS: { code: -32602, message: 'Invalid params' }
};

const methods = {
  sum: (...values) => values.reduce((total, value) => total + value, 0),
  mul: (...values) => values.reduce((total, value) => total * value, 1),
  div: (x, y) => x / y,
  proc: (x, y) => (x / y) * 100
};

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload, null, 2);

  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body)
  });
  res.end(body);
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';

    req.setEncoding('utf8');
    req.on('data', chunk => {
      body += chunk;

      if (body.length > 1_000_000) {
        reject(new Error('Request body is too large'));
        req.destroy();
      }
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

function createError(error, id = null) {
  return {
    jsonrpc: '2.0',
    error,
    id
  };
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function getParams(request) {
  const params = request.params;

  if (params === undefined) {
    return [];
  }

  if (Array.isArray(params)) {
    return params;
  }

  if (isPlainObject(params)) {
    if (request.method === 'sum' || request.method === 'mul') {
      return Object.values(params);
    }

    return [params.x, params.y];
  }

  throw JsonRpcError.INVALID_PARAMS;
}

function validateNumbers(values, expectedCount = null) {
  if (expectedCount !== null && values.length !== expectedCount) {
    throw JsonRpcError.INVALID_PARAMS;
  }

  if (!values.every(value => typeof value === 'number' && Number.isFinite(value))) {
    throw JsonRpcError.INVALID_PARAMS;
  }
}

function handleRpcCall(request) {
  const id = Object.hasOwn(request, 'id') ? request.id : null;
  const isNotification = !Object.hasOwn(request, 'id');

  if (!isPlainObject(request) || request.jsonrpc !== '2.0' || typeof request.method !== 'string') {
    return createError(JsonRpcError.INVALID_REQUEST, id);
  }

  const method = methods[request.method];

  if (!method) {
    return isNotification ? null : createError(JsonRpcError.METHOD_NOT_FOUND, id);
  }

  try {
    const params = getParams(request);

    if (request.method === 'div' || request.method === 'proc') {
      validateNumbers(params, 2);
    } else {
      validateNumbers(params);
    }

    if ((request.method === 'div' || request.method === 'proc') && params[1] === 0) {
      throw JsonRpcError.INVALID_PARAMS;
    }

    const result = method(...params);

    return isNotification
      ? null
      : {
          jsonrpc: '2.0',
          result,
          id
        };
  } catch (error) {
    const rpcError = error.code ? error : JsonRpcError.INVALID_PARAMS;
    return isNotification ? null : createError(rpcError, id);
  }
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'GET') {
    return sendJson(res, 200, {
      name: '25-01 JSON-RPC server',
      endpoint: 'POST /',
      methods: Object.keys(methods)
    });
  }

  if (req.method !== 'POST') {
    res.writeHead(405, { Allow: 'GET, POST' });
    return res.end();
  }

  let payload;

  try {
    payload = JSON.parse(await readRequestBody(req));
  } catch {
    return sendJson(res, 200, createError(JsonRpcError.PARSE_ERROR));
  }

  if (Array.isArray(payload)) {
    if (payload.length === 0) {
      return sendJson(res, 200, createError(JsonRpcError.INVALID_REQUEST));
    }

    const responses = payload.map(handleRpcCall).filter(Boolean);

    if (responses.length === 0) {
      res.writeHead(204);
      return res.end();
    }

    return sendJson(res, 200, responses);
  }

  const response = handleRpcCall(payload);

  if (!response) {
    res.writeHead(204);
    return res.end();
  }

  return sendJson(res, 200, response);
});

server.listen(PORT, () => {
  console.log(`25-01 JSON-RPC server is running at http://localhost:${PORT}`);
});
