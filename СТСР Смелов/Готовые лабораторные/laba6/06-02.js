const http = require('http');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');
const nodemailer = require('nodemailer');

const PORT = 3000;
const formPath = path.join(__dirname, 'form.html');

let mailConfig;
try {
    mailConfig = require('./mailconfig.json');
} catch (e) {
    console.error('Не удалось загрузить mailconfig.json:', e);
    process.exit(1);
}

if (!mailConfig || !mailConfig.host || !mailConfig.auth || !mailConfig.auth.user) {
    console.error('mailconfig.json должен содержать host и auth.user');
    process.exit(1);
}


function resolvePassword() {
    if (process.env.SMTP_PASS) return String(process.env.SMTP_PASS).trim();
    const passFilePath = path.join(__dirname, 'nodemailer pass');
    if (fs.existsSync(passFilePath)) return fs.readFileSync(passFilePath, 'utf8').trim();
    return null;
}

const pass = resolvePassword();
if (!pass) {
    console.error('Не найден SMTP_PASS (env) и/или файл "nodemailer pass"');
    process.exit(1);
}

mailConfig = {
    ...mailConfig,
    auth: {
        ...mailConfig.auth,
        pass,
    },
};

const transporter = nodemailer.createTransport(mailConfig);

function sendMailHandler(data, res) {
    const body = querystring.parse(data);
    const { from, to, subject, message } = body;

    if (!from || !to || !message) {
        res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Поле от, кому и сообщение обязательны.');
        return;
    }

    const sendOptions = {
        from,
        to,
        subject: subject || 'Без темы',
        html: `<p>${String(message).replace(/\n/g, '<br>')}</p>`,
    };

    transporter.sendMail(sendOptions, (err, info) => {
        console.log('nodemailer err:', err);
        console.log('nodemailer info:', info);
        if (err) {
            res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('Ошибка отправки: ' + (err.message || String(err)));
            return;
        }

        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`<p>Письмо отправлено!</p><p>from: ${from}</p><p>to: ${to}</p><p>info: ${info.response || 'ok'}</p>`);
    });
}

const server = http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/') {
        fs.readFile(formPath, 'utf8', (err, html) => {
            if (err) {
                console.error('Ошибка чтения form.html:', err);
                res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
                res.end('Внутренняя ошибка сервера');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(html);
        });
        return;
    }

    if (req.method === 'POST' && req.url === '/send') {
        let body = '';
        req.on('data', chunk => {
            body += chunk;
            if (body.length > 1e6) {
                req.connection.destroy();
            }
        });
        req.on('end', () => sendMailHandler(body, res));
        return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Не найдено');
});

server.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});