const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { User } = require('../models');

// JWT token oluşturma fonksiyonu
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'your_jwt_secret_key',
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

// Kullanıcı kaydı
exports.register = async (req, res) => {
  try {
    const { username, email, password, fullName } = req.body;
    
    // Kullanıcı zaten var mı kontrol et
    const existingUser = await User.findOne({ 
      where: { 
        [Op.or]: [{ email }, { username }] 
      } 
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        message: 'Bu e-posta veya kullanıcı adı zaten kullanılıyor.' 
      });
    }
    
    // Yeni kullanıcı oluştur
    const user = await User.create({
      username,
      email,
      password,
      fullName
    });
    
    // Şifreyi yanıtta gönderme
    user.password = undefined;
    
    // Token oluştur
    const token = generateToken(user.id);
    
    res.status(201).json({
      message: 'Kullanıcı başarıyla oluşturuldu',
      user,
      token
    });
    
  } catch (error) {
    console.error('Kayıt hatası:', error);
    res.status(500).json({ 
      message: 'Kullanıcı kaydı sırasında bir hata oluştu', 
      error: error.message 
    });
  }
};

// Kullanıcı girişi
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Kullanıcıyı bul
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    
    // Şifreyi kontrol et
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Geçersiz şifre' });
    }
    
    // Son giriş tarihini güncelle
    user.lastLogin = new Date();
    await user.save();
    
    // Şifreyi yanıtta gönderme
    user.password = undefined;
    
    // Token oluştur
    const token = generateToken(user.id);
    
    res.json({
      message: 'Giriş başarılı',
      user,
      token
    });
    
  } catch (error) {
    console.error('Giriş hatası:', error);
    res.status(500).json({ 
      message: 'Giriş sırasında bir hata oluştu', 
      error: error.message 
    });
  }
};

// Mevcut kullanıcı bilgisini getir
exports.getMe = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    
    res.json({ user });
    
  } catch (error) {
    console.error('Kullanıcı bilgisi getirme hatası:', error);
    res.status(500).json({ 
      message: 'Kullanıcı bilgisi alınırken bir hata oluştu', 
      error: error.message 
    });
  }
}; 