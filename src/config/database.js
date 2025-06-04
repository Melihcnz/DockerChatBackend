const { Sequelize } = require('sequelize');

// Çevre değişkenlerini yükle
require('dotenv').config();

// Sequelize bağlantısı oluştur
const sequelize = new Sequelize(
  process.env.DB_NAME || 'social_media_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Bağlantıyı doğrula ve dışa aktar
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Veritabanı bağlantısı başarıyla kuruldu.');
  } catch (error) {
    console.error('Veritabanı bağlantısı kurulamadı:', error);
  }
};

module.exports = {
  sequelize,
  testConnection
}; 