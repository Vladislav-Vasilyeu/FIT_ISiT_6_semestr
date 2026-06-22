const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:4000');
ws.on('open', () => {
  console.log('open');
  ws.send(JSON.stringify({ jsonrpc: '2.0', method: 'square', params: [3], id: 1 }));
});
ws.on('message', data => {
  console.log('msg', data.toString());
  ws.close();
});
ws.on('error', e => console.error('err', e.message));
