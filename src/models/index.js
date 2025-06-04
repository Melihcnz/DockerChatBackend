const User = require('./User');
const Post = require('./Post');
const Comment = require('./Comment');
const Like = require('./Like');
const Message = require('./Message');
const Notification = require('./Notification');

// Kullanıcı ve Gönderi ilişkisi
User.hasMany(Post, { foreignKey: 'userId', as: 'posts' });
Post.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Kullanıcı ve Yorum ilişkisi
User.hasMany(Comment, { foreignKey: 'userId', as: 'comments' });
Comment.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Gönderi ve Yorum ilişkisi
Post.hasMany(Comment, { foreignKey: 'postId', as: 'comments' });
Comment.belongsTo(Post, { foreignKey: 'postId', as: 'post' });

// Beğeni ilişkileri
User.hasMany(Like, { foreignKey: 'userId', as: 'likes' });
Like.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Mesaj ilişkileri
User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
User.hasMany(Message, { foreignKey: 'receiverId', as: 'receivedMessages' });
Message.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' });

// Bildirim ilişkileri
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Notification, { foreignKey: 'initiatorId', as: 'initiatedNotifications' });
Notification.belongsTo(User, { foreignKey: 'initiatorId', as: 'initiator' });

// Veritabanı senkronizasyonu için kullanılacak model listesi
const models = {
  User,
  Post,
  Comment,
  Like,
  Message,
  Notification
};

module.exports = models; 