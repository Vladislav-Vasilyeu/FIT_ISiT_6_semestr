
const { error } = require('console');
const http = require('http');
const url = require('url');
const fs = require('fs');

const host = 'localhost';
const port = 5000;

const fact = (n) => {
    if(n === 1 || n === 0) return 1;
    return n * fact(n-1);
}

const server = http.createServer( (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    if(parsedUrl.pathname === '/fact')
    {
        console.log(parsedUrl.pathname)

        const k = parsedUrl.query.k;
        console.log(k);
        if(typeof k != 'undefined')
        {
            const num = parseInt(k);
            console.log(num);
            if( Number.isInteger(num) && k >=0)
            {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json; charset=utf-8')
                res.end(JSON.stringify({ k:num, fact: fact(num)}));
            }
            else{
                res.statusCode = 400;
                res.setHeader('Contente-Type', 'application/json; charset=utf-8');
                res.end(JSON.stringify({error: 'k must be a non-negative integer'}));
            }
        }
    }
    else if (parsedUrl.pathname === '/')
    {
        const html = fs.readFileSync('./03-03.html');
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.end(html);
    }
    else {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/plain');
        res.end('404 Not Found');
    }

})

server.listen(port, host, () => {
    console.log(`Server start at http://${host}:${port}/`)
})