const express = require('express');
const routeTable = require('./routes/routeTable');
const controller = require('./controllers/controller');

const app = express();
app.use(express.json());

routeTable.forEach(route => {
    const ctrl = controller;
    const action = ctrl[route.action];
    if (!action) throw new Error(`Action ${route.action} not found in controller`);

    app[route.method.toLowerCase()](route.path, action);
});

const server = app.listen(3000, () => {
    console.log('server is listening on port 3000');
});

process.on('SIGINT', () => {
    console.log('shut down server');
    server.close(() => {
        console.log('server closed');
        process.exit(0);
    });
});