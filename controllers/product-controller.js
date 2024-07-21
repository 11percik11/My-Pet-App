const { prisma } = require('../prisma/prisma-client');
const path = require("path");
const Jdenticon = require("jdenticon");
const fs = require("fs");

const ProductController = {
  createProduct: async (req, res) => {
    const { title, description, price } = req.body;

    const userId = req.user.userId;

    if (!title || !description || !price ) {
      return res.status(400).json({ error: 'Все поля обязательны' });
    }

    try {
      const png = Jdenticon.toPng(title, 200);
      const avatarProduct = `${title}_${Date.now()}.png`;
      const avatarPath = path.join(__dirname, "/../uploads", avatarProduct);
      fs.writeFileSync(avatarPath, png);

      const numericPrice = parseFloat(price);
      if (isNaN(numericPrice)) {
        return res.status(400).json({ error: 'Цена должна быть числом' });
      }

      const product = await prisma.product.create({
        data: {
          title,
          description,
          price: numericPrice,
          avatarUrl: `/uploads/${avatarProduct}`,
          userId
        },
      });

      res.json(product);
    } catch (error) {
      console.error("Error in createPost:", error);

      res.status(500).json({ error: 'There was an error creating the post' });
    }
  },

  getAllProducts: async (req, res) => {
    const userId = req.user.userId;
    try {
      const products = await prisma.product.findMany({
        include: {
          likes: true,
          user: true,
          comments: true
        },
        orderBy: {
          createdAt: 'desc' // 'desc' означает сортировку по убыванию, т.е. новые посты будут первыми
        }
      });

      const postsWithLikeInfo = products.map(product => ({
        product,
        likedByUser: product.likes.some(like => like.userId === userId)
      }));

      res.json(postsWithLikeInfo);
    } catch (err) {
      res.status(500).json({ error: 'Произошла ошибка при получении постов44' });
    }
  },

  getProductById: async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;

    try {
      const product = await prisma.product.findUnique({
        where: { id },
        include: {
          comments: {
            include: {
              user: true,
            }
          },
          likes: true,
          user: true
        }, // Include related posts
      });

      if (!product) {
        return res.status(404).json({ error: 'Пост не найден' });
      }

      const productWithLikeInfo = {
        ...product,
        likedByUser: product.likes.some(like => like.userId === userId)
      };

      res.json(productWithLikeInfo);
    } catch (error) {
      res.status(500).json({ error: 'Произошла ошибка при получении поста' });
    }
 },


  deleteProduct: async (req, res) => {
    const { id } = req.params;

    // Проверка, что пользователь удаляет свой пост
    const product = await prisma.product.findUnique({ where: { id } });

    if (!product) {
      return res.status(404).json({ error: "Пост не найден" });
    }

    if (product.userId !== req.user.userId) {
      return res.status(403).json({ error: "Нет доступа" });
    }

    try {
      const avatarPath = path.join(__dirname, `/..${product.avatarUrl}`);
      fs.unlink(avatarPath, (err) => {
        if (err) {
          console.error("Ошибка при удалении файла:", err);
          return res.status(500).json({ error: 'Ошибка при удалении файла' });
        }

        console.log("Файл успешно удален");
      });


      const transaction = await prisma.$transaction([
        prisma.comment.deleteMany({ where: { productId: id } }),
        prisma.like.deleteMany({ where: { productId: id } }),
        prisma.product.delete({ where: { id } }),
      ]);

      res.json(transaction);
    } catch (error) {
      res.status(500).json({ error: 'Что-то пошло не так' });
    }
  },
  updateProduct: async (req, res) => {
    const { id } = req.params;
    const { title, description, price } = req.body;

    let filePath;

    if (req.file && req.file.path) {
      filePath = req.file.path;
    }

    // Проверка, что пользователь удаляет свой пост
    const product = await prisma.product.findUnique({ where: { id } });

    if (!product) {
      return res.status(404).json({ error: "Пост не найден" });
    }

    if (product.userId !== req.user.userId) {
      return res.status(403).json({ error: "Нет доступа" });
    }
    try {
      const numericPrice = parseFloat(price);
      // if (isNaN(numericPrice)) {
      //   return res.status(400).json({ error: 'Цена должна быть числом' });
      // }

      const product = await prisma.product.update({
        where: { id },
        data: {
          title: title || undefined,
          description: description || undefined,
          price: numericPrice || undefined,
          avatarUrl: filePath ? `/${filePath}` : undefined,
        }
      })
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: "Что-то пошло не так" });
    }
  }
};

module.exports = ProductController