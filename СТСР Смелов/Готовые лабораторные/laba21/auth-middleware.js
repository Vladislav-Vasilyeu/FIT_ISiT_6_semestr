const users = require('./data/users.json');
const fs = require('fs');

function renderHtml(file, data = {}) {
    let html = fs.readFileSync(`./views/${file}`, 'utf8');
    for (let key in data) {
        html = html.replace(new RegExp(`{{${key}}}`, 'g'), data[key]);
    }
    return html;
}

function formsAuthMiddleware(req, res, next) {
    if (req.session && req.session.authenticated) {
        return next();
    }

    if (req.path === '/login' && req.method === 'POST') {
        const { username, password } = req.body;
        if (username && password && users[username] && users[username] === password) {
            req.session.authenticated = true;
            req.session.username = username;
            req.session.createdAt = Date.now();
            return res.redirect('/resource');
        }
        return res.status(401).send(renderHtml('login.html', {
            title: 'Forms Authentication',
            message: 'Введите логин и пароль',
            authType: 'FORMS',
            error: 'Неверное имя пользователя или пароль'
        }));
    }

    if (req.path === '/login' && req.method === 'GET') {
        return res.send(renderHtml('login.html', {
            title: 'Forms Authentication',
            message: 'Введите логин и пароль для входа',
            authType: 'FORMS'
        }));
    }

    if (!req.session || !req.session.authenticated) {
        return res.redirect('/login');
    }

    next();
}

function logout(req, res) {
    const username = req.session?.username;
    req.session.destroy(() => {
        res.send(renderHtml('logout.html', {
            title: 'Выход из системы',
            message: `${username || 'Пользователь'}, вы успешно вышли`
        }));
    });
}

module.exports = { formsAuthMiddleware, logout, renderHtml };