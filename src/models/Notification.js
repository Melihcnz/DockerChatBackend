const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Bildirimi alacak kullanıcı ID'
  },
  initiatorId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Bildirimi tetikleyen kullanıcı ID (varsa)'
  },
  type: {
    type: DataTypes.ENUM('like', 'comment', 'follow', 'message', 'system'),
    allowNull: false
  },
  contentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'İlgili içerik ID (gönderi, yorum, vb.)'
  },
  contentType: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'İçerik tipi (post, comment, vb.)'
  },
  message: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'notifications',
  timestamps: true
});

module.exports = Notification; 