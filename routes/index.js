const express = require('express');
const router = express.Router();
const multer = require('multer');

const uploadDestination = 'uploads';

// Показываем, где хранить загружаемые файлы
const storage = multer.diskStorage({
  destination: uploadDestination,
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

router.get('/register', (req, res) => {
    try {
        let body = req.body;
        res.status(200).json(body);
    } catch (error) {
        res.status(400).json(error);
    }
})


module.exports = router;