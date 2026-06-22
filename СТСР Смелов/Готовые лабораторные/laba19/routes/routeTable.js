const routeTable = [
    {method: 'GET', path: '/users', controller: 'controller', action: 'getAll'},
    {method: 'GET', path: '/users/:id', controller: 'controller', action: 'getOne'},
    {method: 'POST', path: '/users', controller: 'controller', action: 'create'},
    {method: 'PUT', path: '/users/:id', controller: 'controller', action: 'update'},
    {method: 'DELETE', path: '/users/:id', controller: 'controller', action: 'delete'}
];

module.exports = routeTable;