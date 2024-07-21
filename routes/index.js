const express = require('express');
const router = express.Router();
const multer = require('multer');
const { UserController, ProductController, LikeController, CommentController, ChatController, MessageController } = require('../controllers');
const { authenticateToken } = require('../middleware/auth');

const uploadDestination = 'uploads';

// Показываем, где хранить загружаемые файлы
const storage = multer.diskStorage({
  destination: uploadDestination,
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

router.post('/register', UserController.register);
router.post('/login', UserController.login);
router.get("/current", authenticateToken, UserController.current);
router.get("/users/:id", authenticateToken, UserController.getUserById);
router.put("/users/:id", authenticateToken, UserController.updateUser);

router.post("/product", authenticateToken, ProductController.createProduct);
router.get("/product", authenticateToken, ProductController.getAllProducts);
router.get("/product/:id", authenticateToken, ProductController.getProductById);
router.delete("/product/:id", authenticateToken, ProductController.deleteProduct);
router.put("/product/:id", authenticateToken, ProductController.updateProduct);

router.post("/likes", authenticateToken, LikeController.likeProduct);
router.delete("/likes", authenticateToken, LikeController.unlikeProduct);

router.post("/comments/:id", authenticateToken, CommentController.createComment);
router.delete("/comments/:id", authenticateToken, CommentController.deleteComment);
router.put("/comments/:id", authenticateToken, CommentController.updateComment);

router.post("/chat/:id", authenticateToken, ChatController.createChat);

router.post("/message/:id", authenticateToken, MessageController.createMessage);
router.put("/message/:id", authenticateToken, MessageController.updateMessage);


// router.get('/register', (req, res) => {
//     try {
//         let body = req.body;
//         res.status(200).json(body);
//     } catch (error) {
//         res.status(400).json(error);
//     }
// })


module.exports = router;