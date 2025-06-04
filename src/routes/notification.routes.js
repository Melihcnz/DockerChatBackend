const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const { authenticate } = require('../middleware/auth.middleware');

// Bildirimleri getir
router.get('/', authenticate, notificationController.getUserNotifications);

// Okunmamış bildirim sayısını getir
router.get('/unread/count', authenticate, notificationController.getUnreadCount);

// Bildirimi okundu olarak işaretle
router.put('/:notificationId/read', authenticate, notificationController.markAsRead);

// Tüm bildirimleri okundu olarak işaretle
router.put('/read-all', authenticate, notificationController.markAllAsRead);

module.exports = router; 