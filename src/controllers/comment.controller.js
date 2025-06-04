const { Comment, User, Post, Like } = require('../models');
const { sendLikeNotification, sendCommentNotification } = require('../utils/socket');

// Gönderi yorumlarını getir
exports.getPostComments = async (req, res) => {
  try {
    const { postId } = req.params;
    
    // Gönderi var mı kontrol et
    const post = await Post.findOne({
      where: { 
        id: postId,
        isActive: true 
      }
    });
    
    if (!post) {
      return res.status(404).json({ message: 'Gönderi bulunamadı' });
    }
    
    const comments = await Comment.findAll({
      where: { 
        postId,
        isActive: true 
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'fullName', 'profileImage']
        }
      ],
      order: [['createdAt', 'ASC']]
    });
    
    res.json(comments);
    
  } catch (error) {
    console.error('Yorum listesini getirme hatası:', error);
    res.status(500).json({ 
      message: 'Yorumlar alınırken bir hata oluştu', 
      error: error.message 
    });
  }
};

// Yeni yorum oluştur
exports.createComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;
    
    // Gönderi var mı kontrol et
    const post = await Post.findOne({
      where: { 
        id: postId,
        isActive: true 
      }
    });
    
    if (!post) {
      return res.status(404).json({ message: 'Gönderi bulunamadı' });
    }
    
    const comment = await Comment.create({
      postId,
      userId,
      content
    });
    
    // Yeni oluşturulan yorumu ilişkileriyle birlikte getir
    const newComment = await Comment.findByPk(comment.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'fullName', 'profileImage']
        }
      ]
    });

    // Socket.IO ile bildirim gönder
    await sendCommentNotification(userId, post.userId, postId, comment.id);
    
    res.status(201).json({
      message: 'Yorum başarıyla oluşturuldu',
      comment: newComment
    });
    
  } catch (error) {
    console.error('Yorum oluşturma hatası:', error);
    res.status(500).json({ 
      message: 'Yorum oluşturulurken bir hata oluştu', 
      error: error.message 
    });
  }
};

// Yorum güncelle
exports.updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;
    
    const comment = await Comment.findByPk(id);
    
    if (!comment) {
      return res.status(404).json({ message: 'Yorum bulunamadı' });
    }
    
    // Yorum sahibi mi kontrol et
    if (comment.userId !== userId) {
      return res.status(403).json({ message: 'Bu yorumu düzenleme yetkiniz yok' });
    }
    
    await comment.update({ content });
    
    res.json({
      message: 'Yorum başarıyla güncellendi',
      comment
    });
    
  } catch (error) {
    console.error('Yorum güncelleme hatası:', error);
    res.status(500).json({ 
      message: 'Yorum güncellenirken bir hata oluştu', 
      error: error.message 
    });
  }
};

// Yorum sil (soft delete)
exports.deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const comment = await Comment.findByPk(id);
    
    if (!comment) {
      return res.status(404).json({ message: 'Yorum bulunamadı' });
    }
    
    // Yorum sahibi mi kontrol et
    if (comment.userId !== userId) {
      return res.status(403).json({ message: 'Bu yorumu silme yetkiniz yok' });
    }
    
    await comment.update({ isActive: false });
    
    res.json({ message: 'Yorum başarıyla silindi' });
    
  } catch (error) {
    console.error('Yorum silme hatası:', error);
    res.status(500).json({ 
      message: 'Yorum silinirken bir hata oluştu', 
      error: error.message 
    });
  }
};

// Yorum beğen/beğeniyi geri al
exports.likeComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const comment = await Comment.findOne({
      where: { 
        id,
        isActive: true 
      }
    });
    
    if (!comment) {
      return res.status(404).json({ message: 'Yorum bulunamadı' });
    }
    
    // Daha önce beğenmiş mi kontrol et
    const existingLike = await Like.findOne({
      where: {
        userId,
        contentId: id,
        contentType: 'comment'
      }
    });
    
    if (existingLike) {
      // Beğeniyi kaldır
      await existingLike.destroy();
      
      // Yorum beğeni sayısını güncelle
      await comment.update({ likes: comment.likes - 1 });
      
      return res.json({ message: 'Yorum beğenisi kaldırıldı' });
    }
    
    // Yeni beğeni oluştur
    await Like.create({
      userId,
      contentId: id,
      contentType: 'comment'
    });
    
    // Yorum beğeni sayısını güncelle
    await comment.update({ likes: comment.likes + 1 });

    // Socket.IO ile bildirim gönder
    await sendLikeNotification(userId, comment.userId, id, 'comment');
    
    res.json({ message: 'Yorum beğenildi' });
    
  } catch (error) {
    console.error('Yorum beğenme hatası:', error);
    res.status(500).json({ 
      message: 'Yorum beğenilirken bir hata oluştu', 
      error: error.message 
    });
  }
}; 