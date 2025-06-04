const { Notification, User } = require('../models');

// Kullanıcının bildirimlerini getir
exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const notifications = await Notification.findAll({
      where: { userId },
      include: [
        {
          model: User,
          as: 'initiator',
          attributes: ['id', 'username', 'fullName', 'profileImage']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: 50
    });
    
    res.json(notifications);
    
  } catch (error) {
    console.error('Bildirimleri getirme hatası:', error);
    res.status(500).json({ 
      message: 'Bildirimler alınırken bir hata oluştu', 
      error: error.message 
    });
  }
};

// Okunmamış bildirim sayısını getir
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const unreadCount = await Notification.count({
      where: {
        userId,
        isRead: false
      }
    });
    
    res.json({ unreadCount });
    
  } catch (error) {
    console.error('Okunmamış bildirim sayısı getirme hatası:', error);
    res.status(500).json({ 
      message: 'Okunmamış bildirim sayısı alınırken bir hata oluştu', 
      error: error.message 
    });
  }
};

// Bildirimi okundu olarak işaretle
exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { notificationId } = req.params;
    
    const notification = await Notification.findOne({
      where: {
        id: notificationId,
        userId
      }
    });
    
    if (!notification) {
      return res.status(404).json({ message: 'Bildirim bulunamadı' });
    }
    
    await notification.update({ isRead: true });
    
    res.json({ message: 'Bildirim okundu olarak işaretlendi' });
    
  } catch (error) {
    console.error('Bildirim güncelleme hatası:', error);
    res.status(500).json({ 
      message: 'Bildirim güncellenirken bir hata oluştu', 
      error: error.message 
    });
  }
};

// Tüm bildirimleri okundu olarak işaretle
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    
    await Notification.update(
      { isRead: true },
      { where: { userId, isRead: false } }
    );
    
    res.json({ message: 'Tüm bildirimler okundu olarak işaretlendi' });
    
  } catch (error) {
    console.error('Tüm bildirimleri güncelleme hatası:', error);
    res.status(500).json({ 
      message: 'Bildirimler güncellenirken bir hata oluştu', 
      error: error.message 
    });
  }
}; 