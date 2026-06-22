const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const { formsAuthMiddleware, logout, renderHtml } = require('./auth-middleware');

const app = express();

app.use(session({
    secret: 'laba21-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 30 * 60 * 1000 }
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use('/public', express.static('public'));
app.use(formsAuthMiddleware);

app.get('/resource', (req, res) => {
    res.send(renderHtml('resource.html', {
        username: req.session.username,
        loginTime: new Date(req.session.createdAt).toLocaleString(),
        authType: 'FORMS',
        message: 'Доступ разрешён через Forms-аутентификацию'
    }));
});

app.get('/logout', logout);

app.use((req, res) => {
    res.status(404).send(renderHtml('404.html', { requestedUrl: req.url }));
});

app.listen(3000, () => {
    console.log('\n✅ 21-03 FORMS server on http://localhost:3000');
    console.log('🔐 /login - страница входа');
    console.log('🔐 /resource - защищённый ресурс');
    console.log('📋 admin/password123, user1/pass456\n');
});