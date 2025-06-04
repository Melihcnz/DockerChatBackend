const { Post, User, Comment, Like } = require('../models');
const { sendLikeNotification } = require('../utils/socket');

// Tüm gönderileri getir
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.findAll({
      where: { isActive: true },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'fullName', 'profileImage']
        },
        {
          model: Comment,
          as: 'comments',
          where: { isActive: true },
          required: false,
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'fullName', 'profileImage']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.json(posts);
    
  } catch (error) {
    console.error('Gönderi listesini getirme hatası:', error);
    res.status(500).json({ 
      message: 'Gönderiler alınırken bir hata oluştu', 
      error: error.message 
    });
  }
};

// Belirli bir gönderiyi getir
exports.getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const post = await Post.findOne({
      where: { 
        id,
        isActive: true 
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'fullName', 'profileImage']
        },
        {
          model: Comment,
          as: 'comments',
          where: { isActive: true },
          required: false,
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'fullName', 'profileImage']
            }
          ]
        }
      ]
    });
    
    if (!post) {
      return res.status(404).json({ message: 'Gönderi bulunamadı' });
    }
    
    res.json(post);
    
  } catch (error) {
    console.error('Gönderi getirme hatası:', error);
    res.status(500).json({ 
      message: 'Gönderi alınırken bir hata oluştu', 
      error: error.message 
    });
  }
};

// Yeni gönderi oluştur
exports.createPost = async (req, res) => {
  try {
    const { content } = req.body;
    const userId = req.user.id;
    
    // Resim dosyası kontrol et
    const image = req.file ? `/uploads/${req.file.filename}` : null;
    
    const post = await Post.create({
      userId,
      content,
      image
    });
    
    // Yeni oluşturulan gönderiyi ilişkileriyle birlikte getir
    const newPost = await Post.findByPk(post.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'fullName', 'profileImage']
        }
      ]
    });
    
    res.status(201).json({
      message: 'Gönderi başarıyla oluşturuldu',
      post: newPost
    });
    
  } catch (error) {
    console.error('Gönderi oluşturma hatası:', error);
    res.status(500).json({ 
      message: 'Gönderi oluşturulurken bir hata oluştu', 
      error: error.message 
    });
  }
};

// Gönderi güncelle
exports.updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;
    
    const post = await Post.findByPk(id);
    
    if (!post) {
      return res.status(404).json({ message: 'Gönderi bulunamadı' });
    }
    
    // Gönderi sahibi mi kontrol et
    if (post.userId !== userId) {
      return res.status(403).json({ message: 'Bu gönderiyi düzenleme yetkiniz yok' });
    }
    
    // Resim dosyası kontrol et
    const image = req.file ? `/uploads/${req.file.filename}` : post.image;
    
    await post.update({
      content,
      image
    });
    
    res.json({
      message: 'Gönderi başarıyla güncellendi',
      post
    });
    
  } catch (error) {
    console.error('Gönderi güncelleme hatası:', error);
    res.status(500).json({ 
      message: 'Gönderi güncellenirken bir hata oluştu', 
      error: error.message 
    });
  }
};

// Gönderi sil (soft delete)
exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const post = await Post.findByPk(id);
    
    if (!post) {
      return res.status(404).json({ message: 'Gönderi bulunamadı' });
    }
    
    // Gönderi sahibi mi kontrol et
    if (post.userId !== userId) {
      return res.status(403).json({ message: 'Bu gönderiyi silme yetkiniz yok' });
    }
    
    await post.update({ isActive: false });
    
    res.json({ message: 'Gönderi başarıyla silindi' });
    
  } catch (error) {
    console.error('Gönderi silme hatası:', error);
    res.status(500).json({ 
      message: 'Gönderi silinirken bir hata oluştu', 
      error: error.message 
    });
  }
};

// Gönderi beğen/beğeniyi geri al
exports.likePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const post = await Post.findOne({
      where: { 
        id,
        isActive: true 
      }
    });
    
    if (!post) {
      return res.status(404).json({ message: 'Gönderi bulunamadı' });
    }
    
    // Daha önce beğenmiş mi kontrol et
    const existingLike = await Like.findOne({
      where: {
        userId,
        contentId: id,
        contentType: 'post'
      }
    });
    
    if (existingLike) {
      // Beğeniyi kaldır
      await existingLike.destroy();
      
      // Gönderi beğeni sayısını güncelle
      await post.update({ likes: post.likes - 1 });
      
      return res.json({ message: 'Gönderi beğenisi kaldırıldı' });
    }
    
    // Yeni beğeni oluştur
    await Like.create({
      userId,
      contentId: id,
      contentType: 'post'
    });
    
    // Gönderi beğeni sayısını güncelle
    await post.update({ likes: post.likes + 1 });

    // Socket.IO ile bildirim gönder
    await sendLikeNotification(userId, post.userId, id, 'post');
    
    res.json({ message: 'Gönderi beğenildi' });
    
  } catch (error) {
    console.error('Gönderi beğenme hatası:', error);
    res.status(500).json({ 
      message: 'Gönderi beğenilirken bir hata oluştu', 
      error: error.message 
    });
  }
}; 