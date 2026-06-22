const { send } = require('./m0603');


const inputText = process.argv.slice(2).join(' ') || 'Hello from 06-03';

send(inputText)
    .then((info) => {
        console.log('Письмо отправлено!');
        console.log('response:', info && info.response ? info.response : info);
    })
    .catch((err) => {
        console.error('Ошибка отправки:', err && err.message ? err.message : err);
        process.exit(1);
    });

