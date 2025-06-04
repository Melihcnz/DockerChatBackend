const { sequelize } = require('./database');
const models = require('../models');

// Veritabanını senkronize et ve tabloları oluştur
const initializeDatabase = async () => {
  try {
    // Sequelize bağlantısını doğrula
    await sequelize.authenticate();
    console.log('Veritabanı bağlantısı başarıyla kuruldu.');
    
    // Veritabanı tablolarını oluştur
    // force: true tüm tabloları siler ve yeniden oluşturur (geliştirme ortamında kullanışlı)
    // force: false tabloları sadece yoksa oluşturur
    await sequelize.sync({ force: process.env.NODE_ENV === 'development' });
    console.log('Veritabanı tabloları başarıyla oluşturuldu.');
    
    return true;
  } catch (error) {
    console.error('Veritabanı başlatılırken hata oluştu:', error);
    return false;
  }
};

module.exports = initializeDatabase; 