const jwt = require('jsonwebtoken');
const { User } = require('../models');

// JWT token doğrulama middleware
exports.authenticate = async (req, res, next) => {
  try {
    // Header'dan token al
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Yetkilendirme başarısız. Token sağlanmadı.' });
    }
    
    // Token'ı çıkart
    const token = authHeader.split(' ')[1];
    
    // Token'ı doğrula
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
    
    // Kullanıcıyı bul
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    
    // Kullanıcı aktif değilse engelle
    if (!user.isActive) {
      return res.status(403).json({ message: 'Hesabınız askıya alınmış' });
    }
    
    // Request nesnesine kullanıcı bilgisini ekle
    req.user = user;
    
    next();
    
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Geçersiz token' });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token süresi doldu' });
    }
    
    console.error('Yetkilendirme hatası:', error);
    res.status(500).json({ 
      message: 'Yetkilendirme sırasında bir hata oluştu', 
      error: error.message 
    });
  }
}; 