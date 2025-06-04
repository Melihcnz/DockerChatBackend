const { Server } = require('socket.io');
const { User, Message, Notification } = require('./models');

// Çevrimiçi kullanıcılar
const onlineUsers = new Map(); // Kullanıcı ID -> Socket ID eşlemesi

// Socket.IO sunucusu başlatma
const initSocketServer = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: '*', // Production'da bu değeri kısıtlayın
      methods: ['GET', 'POST']
    }
  });
  
  // Socket.IO bağlantıları
  io.on('connection', (socket) => {
    console.log('Yeni kullanıcı bağlandı:', socket.id);
    
    // Kullanıcı kimlik doğrulama
    socket.on('authenticate', (userId) => {
      onlineUsers.set(parseInt(userId), socket.id);
      console.log(`Kullanıcı ${userId} bağlandı, socket ID: ${socket.id}`);
      
      // Tüm istemcilere çevrimiçi kullanıcı listesini gönder
      io.emit('online_users', Array.from(onlineUsers.keys()));
    });
    
    // Özel mesaj odası kurulumu
    socket.on('join_private_room', (roomId) => {
      socket.join(roomId);
      console.log(`Kullanıcı ${socket.id} oda ${roomId}'ye katıldı`);
    });
    
    // Özel mesaj
    socket.on('private_message', async (data) => {
      const { senderId, receiverId, content, image } = data;
      
      try {
        // Mesajı veritabanına kaydet
        const message = await Message.create({
          senderId,
          receiverId,
          content,
          image
        });
        
        // Bildirim oluştur
        await Notification.create({
          userId: receiverId,
          initiatorId: senderId,
          type: 'message',
          message: 'Yeni bir mesaj aldınız',
          contentId: message.id,
          contentType: 'message'
        });
        
        // Alıcı online mı kontrol et
        const receiverSocketId = onlineUsers.get(parseInt(receiverId));
        
        // Görüşme odasını belirle (her zaman küçük ID önce)
        const roomId = `chat_${Math.min(senderId, receiverId)}_${Math.max(senderId, receiverId)}`;
        
        // Mesajı odaya yayınla
        io.to(roomId).emit('private_message', {
          ...message.toJSON(),
          isRead: receiverSocketId ? true : false
        });
        
        // Alıcı online ise doğrudan gönder
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('notification', {
            type: 'message',
            senderId,
            message: 'Yeni bir mesaj aldınız'
          });
        }
        
      } catch (error) {
        console.error('Mesaj gönderme hatası:', error);
        socket.emit('error', { message: 'Mesaj gönderilemedi.' });
      }
    });
    
    // Yazıyor göstergesi
    socket.on('typing', (data) => {
      const { senderId, receiverId, isTyping } = data;
      const roomId = `chat_${Math.min(senderId, receiverId)}_${Math.max(senderId, receiverId)}`;
      
      // "X yazıyor..." mesajını odaya ilet
      socket.to(roomId).emit('typing', { userId: senderId, isTyping });
    });
    
    // Gönderi/yorum beğeni bildirimi
    socket.on('like_notification', async (data) => {
      const { senderId, receiverId, contentId, contentType } = data;
      
      try {
        // Bildirim oluştur
        await Notification.create({
          userId: receiverId,
          initiatorId: senderId,
          type: 'like',
          message: contentType === 'post' ? 'Gönderiniz beğenildi' : 'Yorumunuz beğenildi',
          contentId,
          contentType
        });
        
        // Alıcı online mı kontrol et
        const receiverSocketId = onlineUsers.get(parseInt(receiverId));
        
        // Alıcı online ise bildirim gönder
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('notification', {
            type: 'like',
            senderId,
            contentId,
            contentType,
            message: contentType === 'post' ? 'Gönderiniz beğenildi' : 'Yorumunuz beğenildi'
          });
        }
      } catch (error) {
        console.error('Beğeni bildirimi hatası:', error);
      }
    });
    
    // Yorum bildirimi
    socket.on('comment_notification', async (data) => {
      const { senderId, receiverId, postId, commentId } = data;
      
      try {
        // Bildirim oluştur
        await Notification.create({
          userId: receiverId,
          initiatorId: senderId,
          type: 'comment',
          message: 'Gönderinize yorum yapıldı',
          contentId: postId,
          contentType: 'post'
        });
        
        // Alıcı online mı kontrol et
        const receiverSocketId = onlineUsers.get(parseInt(receiverId));
        
        // Alıcı online ise bildirim gönder
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('notification', {
            type: 'comment',
            senderId,
            postId,
            commentId,
            message: 'Gönderinize yorum yapıldı'
          });
        }
      } catch (error) {
        console.error('Yorum bildirimi hatası:', error);
      }
    });
    
    // Bağlantı kesildiğinde
    socket.on('disconnect', () => {
      console.log('Kullanıcı ayrıldı:', socket.id);
      
      // Kullanıcıyı çevrimiçi listesinden kaldır
      let userId = null;
      for (const [key, value] of onlineUsers.entries()) {
        if (value === socket.id) {
          userId = key;
          break;
        }
      }
      
      if (userId) {
        onlineUsers.delete(userId);
        // Tüm istemcilere güncel çevrimiçi kullanıcı listesini gönder
        io.emit('online_users', Array.from(onlineUsers.keys()));
      }
    });
  });
  
  return io;
};

// Bildirim gönderme fonksiyonları
const sendLikeNotification = async (io, userId, postOwnerId, contentId, contentType) => {
  if (userId === postOwnerId) return; // Kendi gönderisini beğendiyse bildirim gönderme
  
  try {
    // Bildirim oluştur
    await Notification.create({
      userId: postOwnerId,
      initiatorId: userId,
      type: 'like',
      message: contentType === 'post' ? 'Gönderiniz beğenildi' : 'Yorumunuz beğenildi',
      contentId,
      contentType
    });
    
    // Alıcı online mı kontrol et
    const receiverSocketId = onlineUsers.get(postOwnerId);
    
    // Alıcı online ise bildirim gönder
    if (receiverSocketId && io) {
      io.to(receiverSocketId).emit('notification', {
        type: 'like',
        senderId: userId,
        contentId,
        contentType,
        message: contentType === 'post' ? 'Gönderiniz beğenildi' : 'Yorumunuz beğenildi'
      });
    }
  } catch (error) {
    console.error('Beğeni bildirimi gönderme hatası:', error);
  }
};

const sendCommentNotification = async (io, userId, postOwnerId, postId, commentId) => {
  if (userId === postOwnerId) return; // Kendi gönderisine yorum yaptıysa bildirim gönderme
  
  try {
    // Bildirim oluştur
    await Notification.create({
      userId: postOwnerId,
      initiatorId: userId,
      type: 'comment',
      message: 'Gönderinize yorum yapıldı',
      contentId: postId,
      contentType: 'post'
    });
    
    // Alıcı online mı kontrol et
    const receiverSocketId = onlineUsers.get(postOwnerId);
    
    // Alıcı online ise bildirim gönder
    if (receiverSocketId && io) {
      io.to(receiverSocketId).emit('notification', {
        type: 'comment',
        senderId: userId,
        postId,
        commentId,
        message: 'Gönderinize yorum yapıldı'
      });
    }
  } catch (error) {
    console.error('Yorum bildirimi gönderme hatası:', error);
  }
};

// Kullanıcı durumu fonksiyonları
const isUserOnline = (userId) => {
  return onlineUsers.has(userId);
};

const getOnlineUsers = () => {
  return Array.from(onlineUsers.keys());
};

module.exports = {
  initSocketServer,
  onlineUsers,
  sendLikeNotification,
  sendCommentNotification,
  isUserOnline,
  getOnlineUsers
}; 