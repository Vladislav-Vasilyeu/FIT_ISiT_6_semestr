const express = require('express');
const passport = require('passport');
const BasicStrategy = require('passport-http').BasicStrategy;
const fs = require('fs');
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

passport.use(new BasicStrategy((username, password, done) => {
    if (users[username] && users[username] === password) {
        return done(null, { username, time: new Date().toISOString() });
    }
    return done(null, false);
}));

app.use(passport.initialize());

app.get('/login', (req, res) => {
    res.send(renderHtml('login.html', {
        title: 'BASIC Authentication',
        message: 'Для доступа используйте BASIC-аутентификацию',
        authType: 'BASIC'
    }));
});

app.get('/logout', (req, res) => {
    res.set('WWW-Authenticate', 'Basic realm="Restricted"');
    res.status(401).send(renderHtml('logout.html', {
        title: 'Выход из системы',
        message: 'BASIC не поддерживает logout. Закройте браузер для сброса.'
    }));
});

app.get('/resource',
    passport.authenticate('basic', { session: false }),
    (req, res) => {
        res.send(renderHtml('resource.html', {
            username: req.user.username,
            loginTime: new Date(req.user.time).toLocaleString(),
            authType: 'BASIC',
            message: 'Доступ разрешён через BASIC-аутентификацию'
        }));
    }
);

app.use((req, res) => {
    res.status(404).send(renderHtml('404.html', { requestedUrl: req.url }));
});

app.listen(3000, () => {
    console.log('\n✅ 21-01 BASIC server on http://localhost:3000');
    console.log('🔐 /resource - защищённый ресурс');
    console.log('📋 admin/password123, user1/pass456\n');
});