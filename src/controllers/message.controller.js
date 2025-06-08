const { Message, User, Notification } = require('../models');
const { Op, Sequelize } = require('sequelize');
const { sequelize } = require('../config/database');

// Kullanıcının tüm konuşmalarını getir
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Son mesaja göre gruplandırılmış konuşmaları getir
    const conversations = await Message.findAll({
      attributes: [
        [sequelize.fn('MAX', sequelize.col('id')), 'lastMessageId'],
        [sequelize.fn('MAX', sequelize.col('senderId')), 'senderId'],
        [sequelize.fn('MAX', sequelize.col('receiverId')), 'receiverId'],
        [sequelize.fn('MAX', sequelize.col('createdAt')), 'lastMessageTime']
      ],
      where: {
        [Op.or]: [
          { senderId: userId },
          { receiverId: userId }
        ]
      },
      group: [
        sequelize.fn(
          'LEAST',
          sequelize.col('senderId'),
          sequelize.col('receiverId')
        ),
        sequelize.fn(
          'GREATEST',
          sequelize.col('senderId'),
          sequelize.col('receiverId')
        )
      ],
      order: [[sequelize.fn('MAX', sequelize.col('createdAt')), 'DESC']]
    });
    
    // Konuşma listesini detaylandır
    const conversationsWithDetails = await Promise.all(
      conversations.map(async (conversation) => {
        const lastMessage = await Message.findByPk(conversation.get('lastMessageId'));
        
        // Konuşmanın diğer katılımcısını bul
        const otherUserId = conversation.senderId === userId ? conversation.receiverId : conversation.senderId;
        const otherUser = await User.findByPk(otherUserId, {
          attributes: ['id', 'username', 'fullName', 'profileImage']
        });
        
        // Okunmamış mesaj sayısını hesapla
        const unreadCount = await Message.count({
          where: {
            senderId: otherUserId,
            receiverId: userId,
            isRead: false
          }
        });
        
        return {
          conversationId: `${Math.min(userId, otherUserId)}_${Math.max(userId, otherUserId)}`,
          otherUser,
          lastMessage,
          unreadCount
        };
      })
    );
    
    res.json(conversationsWithDetails);
    
  } catch (error) {
    console.error('Konuşmaları getirme hatası:', error);
    res.status(500).json({ 
      message: 'Konuşmalar alınırken bir hata oluştu', 
      error: error.message 
    });
  }
};

// İki kullanıcı arasındaki mesajları getir
exports.getMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { otherUserId } = req.params;
    
    // Mesajları getir
    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { 
            senderId: userId,
            receiverId: otherUserId
          },
          {
            senderId: otherUserId,
            receiverId: userId
          }
        ]
      },
      order: [['createdAt', 'ASC']]
    });
    
    // Okunmamış mesajları okundu olarak işaretle
    await Message.update(
      { isRead: true },
      {
        where: {
          senderId: otherUserId,
          receiverId: userId,
          isRead: false
        }
      }
    );
    
    res.json(messages);
    
  } catch (error) {
    console.error('Mesajları getirme hatası:', error);
    res.status(500).json({ 
      message: 'Mesajlar alınırken bir hata oluştu', 
      error: error.message 
    });
  }
};

// Yeni mesaj gönder
exports.sendMessage = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiverId, content } = req.body;
    
    // Alıcı var mı kontrol et
    const receiver = await User.findByPk(receiverId);
    
    if (!receiver) {
      return res.status(404).json({ message: 'Alıcı kullanıcı bulunamadı' });
    }
    
    // Resim dosyası kontrol et
    const image = req.file ? `/uploads/${req.file.filename}` : null;
    
    // Mesajı oluştur
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
      message: `${req.user.username} size yeni bir mesaj gönderdi`,
      contentId: message.id,
      contentType: 'message'
    });
    
    res.status(201).json({
      message: 'Mesaj başarıyla gönderildi',
      data: message
    });
    
  } catch (error) {
    console.error('Mesaj gönderme hatası:', error);
    res.status(500).json({ 
      message: 'Mesaj gönderilirken bir hata oluştu', 
      error: error.message 
    });
  }
};

// Okunmamış mesaj sayısını getir
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const unreadCount = await Message.count({
      where: {
        receiverId: userId,
        isRead: false
      }
    });
    
    res.json({ unreadCount });
    
  } catch (error) {
    console.error('Okunmamış mesaj sayısı getirme hatası:', error);
    res.status(500).json({ 
      message: 'Okunmamış mesaj sayısı alınırken bir hata oluştu', 
      error: error.message 
    });
  }
}; 