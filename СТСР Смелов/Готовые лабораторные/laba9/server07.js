const express = require('express');
const multer = require('multer');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10 МБ лимит
});

const app = express();

app.post('/upload-image', upload.single('image'), (req, res) => {
  const stats = fs.statSync(req.file.path);
  
  res.json({
    message: 'Изображение получено',
    originalname: req.file.originalname,
    size: stats.size,
    mimetype: req.file.mimetype,
    savedTo: req.file.path
  });
});

app.listen(3007, () => {
  console.log('Сервер 07 на порту 3007 (image upload)');
  if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');
});