const { User, Post, Comment } = require('../models');
const { Op } = require('sequelize');

// Kullanıcı profili getir
exports.getUserProfile = async (req, res) => {
  try {
    const { username } = req.params;
    
    const user = await User.findOne({
      where: { username },
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    
    res.json({ user });
    
  } catch (error) {
    console.error('Kullanıcı profili getirme hatası:', error);
    res.status(500).json({ 
      message: 'Kullanıcı profili alınırken bir hata oluştu', 
      error: error.message 
    });
  }
};

// Kullanıcının gönderilerini getir
exports.getUserPosts = async (req, res) => {
  try {
    const { username } = req.params;
    
    const user = await User.findOne({
      where: { username }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    
    const posts = await Post.findAll({
      where: { 
        userId: user.id,
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
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.json(posts);
    
  } catch (error) {
    console.error('Kullanıcı gönderileri getirme hatası:', error);
    res.status(500).json({ 
      message: 'Kullanıcı gönderileri alınırken bir hata oluştu', 
      error: error.message 
    });
  }
};

// Profil güncelleme
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fullName, bio } = req.body;
    
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    
    // Profil resmi kontrol et
    const profileImage = req.file ? `/uploads/${req.file.filename}` : user.profileImage;
    
    await user.update({
      fullName,
      bio,
      profileImage
    });
    
    // Şifreyi yanıtta gönderme
    user.password = undefined;
    
    res.json({
      message: 'Profil başarıyla güncellendi',
      user
    });
    
  } catch (error) {
    console.error('Profil güncelleme hatası:', error);
    res.status(500).json({ 
      message: 'Profil güncellenirken bir hata oluştu', 
      error: error.message 
    });
  }
};

// Şifre değiştirme
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    
    // Mevcut şifreyi kontrol et
    const isPasswordValid = await user.comparePassword(currentPassword);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Mevcut şifre hatalı' });
    }
    
    // Yeni şifre ve eski şifre aynı mı kontrol et
    if (currentPassword === newPassword) {
      return res.status(400).json({ message: 'Yeni şifre eski şifre ile aynı olamaz' });
    }
    
    // Şifreyi güncelle
    user.password = newPassword;
    await user.save();
    
    res.json({ message: 'Şifre başarıyla değiştirildi' });
    
  } catch (error) {
    console.error('Şifre değiştirme hatası:', error);
    res.status(500).json({ 
      message: 'Şifre değiştirilirken bir hata oluştu', 
      error: error.message 
    });
  }
};

// Kullanıcı arama
exports.searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.trim() === '') {
      return res.status(400).json({ message: 'Arama sorgusu gereklidir' });
    }
    
    // Kullanıcı adı veya tam isme göre ara
    const users = await User.findAll({
      where: {
        [Op.or]: [
          { username: { [Op.like]: `%${query}%` } },
          { fullName: { [Op.like]: `%${query}%` } }
        ],
        isActive: true
      },
      attributes: ['id', 'username', 'fullName', 'profileImage', 'bio'],
      limit: 20
    });
    
    res.json({ users });
    
  } catch (error) {
    console.error('Kullanıcı arama hatası:', error);
    res.status(500).json({ 
      message: 'Kullanıcılar aranırken bir hata oluştu', 
      error: error.message 
    });
  }
}; 