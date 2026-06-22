const { send } = require('@vladislav_vasilyev/m0603');

send('Hello from 06-04')
    .then((info) => {
        console.log('Письмо отправлено!');
        console.log('response:', info && info.response ? info.response : info);
    })
    .catch((err) => {
        console.error('Ошибка отправки:', err && err.message ? err.message : err);
        process.exit(1);
    });