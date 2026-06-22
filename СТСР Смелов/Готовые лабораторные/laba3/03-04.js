
const http = require('http');
const url = require('url');
const fs = require('fs');
const { json } = require('stream/consumers');

const host = 'localhost';
const port = 5000;

const fact = (n) => {
    if(n === 1 || n === 0) return 1;
    return n * fact(n-1);
}

function Fact(n, cb) {
    this.fn = n;
    this.ffact = fact;
    this.fcb = cb;
    this.calc = () => {
        process.nextTick(() => {
            this.fcb(null, this.ffact(this.fn));
        });
    };
}

const server = http.createServer( (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    if(parsedUrl.pathname === '/fact')
    {
        console.log(parsedUrl.pathname)

        const k = parsedUrl.query.k;
        console.log('k =', k);
        if(typeof k == 'undefined')
        {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify({error: 'parameter k is required'}));
            return;
        }
        
        const num = parseInt(k);
        console.log('num =', num);
        if( Number.isInteger(num) && num >=0)
        {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            const factInstance = new Fact(num, (err, result) => {
                res.end(JSON.stringify({ k:num, fact: result}))})
            factInstance.calc();
        }
        else{
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify({error: 'k must be a non-negative integer'}));
        }
        
    }
    else if (parsedUrl.pathname === '/')
    {
        fs.readFile('./03-03.html', (err, html) => {
            if(err) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'text/plain');
                res.end('500 Internal  Server Error: cannot read file');
                return;
            }
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.end(html);
        });
        
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