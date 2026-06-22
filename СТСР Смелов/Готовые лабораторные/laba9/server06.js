const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.post('/upload', upload.single('file'), (req, res) => {
  console.log('Получен файл:', req.file);
  console.log('Описание:', req.body.description);
  
  // Читаем содержимое для проверки
  const content = fs.readFileSync(req.file.path, 'utf8');
  
  res.json({
    message: 'Файл успешно получен',
    filename: req.file.originalname,
    size: req.file.size,
    contentPreview: content.substring(0, 100) + '...'
  });
  
  // Удаляем временный файл
  fs.unlinkSync(req.file.path);
});

app.listen(3006, () => console.log('Сервер 06 на порту 3006 (file upload)'));