// Bu dosya frontend'de kullanılacak Socket.IO istemci örneğidir
/*
import { io } from 'socket.io-client';

// Socket bağlantısı oluştur
const socket = io('http://localhost:3000'); // Backend sunucunun URL'si

// Bağlantı durumu dinleyicileri
socket.on('connect', () => {
  console.log('Sunucuya bağlandı:', socket.id);
  
  // Kimlik doğrulama (kullanıcı giriş yaptıktan sonra çağrılmalı)
  const userId = 1; // Giriş yapmış kullanıcının ID'si
  socket.emit('authenticate', userId);
});

socket.on('disconnect', () => {
  console.log('Sunucu bağlantısı kesildi');
});

socket.on('connect_error', (error) => {
  console.error('Bağlantı hatası:', error);
});

// Çevrimiçi kullanıcıları dinle
socket.on('online_users', (users) => {
  console.log('Çevrimiçi kullanıcılar:', users);
  // UI'ı güncelle, çevrimiçi kullanıcıları göster
});

// Yeni bildirimleri dinle
socket.on('notification', (notification) => {
  console.log('Yeni bildirim:', notification);
  
  // Bildirim tipine göre işlem yap
  switch (notification.type) {
    case 'message':
      // Mesaj bildirimi işle
      showMessageNotification(notification);
      break;
    case 'like':
      // Beğeni bildirimi işle
      showLikeNotification(notification);
      break;
    case 'comment':
      // Yorum bildirimi işle
      showCommentNotification(notification);
      break;
  }
});

// Mesajlaşma için özel oda kurulumu
const setupChatRoom = (otherUserId) => {
  // Kullanıcı ID'lerini sırala (küçük ID her zaman önce gelsin)
  const roomId = `chat_${Math.min(currentUserId, otherUserId)}_${Math.max(currentUserId, otherUserId)}`;
  
  // Odaya katıl
  socket.emit('join_private_room', roomId);
  
  // Özel mesajları dinle
  socket.on('private_message', (message) => {
    console.log('Yeni mesaj:', message);
    // Mesajı sohbet arayüzüne ekle
    addMessageToChat(message);
  });
  
  // Yazıyor etkinliğini dinle
  socket.on('typing', (data) => {
    if (data.userId === otherUserId && data.isTyping) {
      showTypingIndicator(otherUserId);
    } else {
      hideTypingIndicator(otherUserId);
    }
  });
  
  return {
    // Mesaj gönder
    sendMessage: (content, image = null) => {
      socket.emit('private_message', {
        senderId: currentUserId,
        receiverId: otherUserId,
        content,
        image
      });
    },
    
    // Yazıyor durumunu gönder
    sendTypingStatus: (isTyping) => {
      socket.emit('typing', {
        senderId: currentUserId,
        receiverId: otherUserId,
        isTyping
      });
    }
  };
};

// Beğeni bildirimini tetikle
const sendLikeNotification = (receiverId, contentId, contentType) => {
  socket.emit('like_notification', {
    senderId: currentUserId,
    receiverId,
    contentId,
    contentType
  });
};

// Yorum bildirimini tetikle
const sendCommentNotification = (receiverId, postId, commentId) => {
  socket.emit('comment_notification', {
    senderId: currentUserId,
    receiverId,
    postId,
    commentId
  });
};

export {
  socket,
  setupChatRoom,
  sendLikeNotification,
  sendCommentNotification
};
*/ 