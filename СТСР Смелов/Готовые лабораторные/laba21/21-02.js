const express = require('express');
const passport = require('passport');
const DigestStrategy = require('passport-http').DigestStrategy;
const fs = require('fs');
const crypto = require('crypto');
const users = require('./data/users.json');

const app = express();
app.use('/public', express.static('public'));

function renderHtml(file, data) {
    let html = fs.readFileSync(`./views/${file}`, 'utf8');
    for (let key in data) {
        html = html.replace(new RegExp(`{{${key}}}`, 'g'), data[key]);
    }
    return html;
}

passport.use(new DigestStrategy({ qop: 'auth' },
    (username, done) => {
        const password = users[username];
        if (!password) return done(null, false);
        return done(null, { username }, password);
    },
    (params, done) => done(null, true)
));

app.use(passport.initialize());

app.get('/login', (req, res) => {
    res.send(renderHtml('login.html', {
        title: 'DIGEST Authentication',
        message: 'Для доступа используйте DIGEST-аутентификацию',
        authType: 'DIGEST'
    }));
});

app.get('/logout', (req, res) => {
    res.set('WWW-Authenticate', 'Digest realm="DIGEST", qop="auth", nonce="' + crypto.randomBytes(16).toString('hex') + '"');
    res.status(401).send(renderHtml('logout.html', {
        title: 'Выход из системы',
        message: 'DIGEST-сессия завершена'
    }));
});

app.get('/resource',
    passport.authenticate('digest', { session: false }),
    (req, res) => {
        res.send(renderHtml('resource.html', {
            username: req.user.username,
            loginTime: new Date().toLocaleString(),
            authType: 'DIGEST',
            message: 'Доступ разрешён через DIGEST-аутентификацию'
        }));
    }
);

app.use((req, res) => {
    res.status(404).send(renderHtml('404.html', { requestedUrl: req.url }));
});

app.listen(3000, () => {
    console.log('\n✅ 21-02 DIGEST server on http://localhost:3000');
    console.log('🔐 /resource - защищённый ресурс');
    console.log('📋 admin/password123, user1/pass456\n');
});