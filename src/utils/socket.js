// Socket.IO işlemleri için yardımcı fonksiyonlar
const socketModule = require('../socket');

// Gönderi beğenildiğinde bildirim gönder
exports.sendLikeNotification = async (userId, postOwnerId, contentId, contentType) => {
  const { app } = require('../app');
  const io = app.get('io');
  
  if (!io) {
    console.error('Socket.IO nesnesi henüz başlatılmamış');
    return;
  }
  
  await socketModule.sendLikeNotification(io, userId, postOwnerId, contentId, contentType);
};

// Yorum yapıldığında bildirim gönder
exports.sendCommentNotification = async (userId, postOwnerId, postId, commentId) => {
  const { app } = require('../app');
  const io = app.get('io');
  
  if (!io) {
    console.error('Socket.IO nesnesi henüz başlatılmamış');
    return;
  }

  await socketModule.sendCommentNotification(io, userId, postOwnerId, postId, commentId);
};

// Kullanıcının çevrimiçi olup olmadığını kontrol et
exports.isUserOnline = (userId) => {
  return socketModule.isUserOnline(userId);
};

// Çevrimiçi kullanıcıların listesini getir
exports.getOnlineUsers = () => {
  return socketModule.getOnlineUsers();
}; 