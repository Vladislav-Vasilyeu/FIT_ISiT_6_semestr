const http = require('http');
const readline = require('readline');

const hostname = '127.0.0.1';
const port = 5000;

const CORR_STATES = ['norm', 'stop', 'test', 'idle'];

let currentState = 'norm';

const rl = readline.createInterface({
    input : process.stdin,
    output: process.stdout
})

const updatePrompt = () => {
    rl.setPrompt(`${currentState} -> `);
    rl.prompt();
}

const server = http.createServer( (req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end(currentState);
})

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
    updatePrompt();
})

rl.on('line', (input) => {
    const command = input.trim();

    if (command === 'exit') {
        
        server.close(() => {
            rl.close();
            process.exit(0);
        });
        return;

    }
    if(CORR_STATES.includes(command)) {
        console.log(`reg = ${currentState} --> ${command}`)
        currentState = command;
    }
    else{
        console.log(command);
    }
    updatePrompt();
})

rl.on('close', () => {
    
    server.close();
    process.exit(0);
  });