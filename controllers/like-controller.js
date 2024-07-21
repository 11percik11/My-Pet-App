const { prisma } = require('../prisma/prisma-client');

const LikeController = {
  likeProduct: async (req, res) => {
    const { productId } = req.body;

    const userId = req.user.userId;

    if (!productId) {
      return res.status(400).json({ error: 'Все поля обязательны' });
    }

    try {
      const existingLike = await prisma.like.findFirst({
        where: { productId, userId },
      });

      if(existingLike) {
        return res.status(400).json({ error: 'Вы уже поставили лайк этому посту' });
      }

      const like = await prisma.like.create({ 
        data: { productId, userId },
      });

      res.json(like);
    } catch (error) {
      res.status(500).json({ error: 'Что-то пошло не так' });
    }
  },

  unlikeProduct: async (req, res) => {
    const { id } = req.body;;
    

    const userId = req.user.userId;

    if (!id) {
      return res.status(400).json({ error: 'Вы уже поставили дизлайк этому посту' });
    }

    try {
      const existingLike = await prisma.like.findFirst({
        where: { productId: id, userId },
      });

      if(!existingLike) {
        return res.status(400).json({ error: 'Лайк уже существует' });
      }

      const like = await prisma.like.deleteMany({
        where: { productId: id, userId },
      });

      res.json(like);
    } catch (error) {
      res.status(500).json({ error: 'Что-то пошло не так' });
    }
  }
};

module.exports = LikeController