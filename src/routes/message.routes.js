const express = require('express');
const router = express.Router();
const messageController = require('../controllers/message.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { uploadPostImage, handleUploadError } = require('../middleware/upload.middleware');

// Tüm konuşmaları getir
router.get('/conversations', authenticate, messageController.getConversations);

// Okunmamış mesaj sayısını getir
router.get('/unread/count', authenticate, messageController.getUnreadCount);

// Yeni mesaj gönder
router.post('/', authenticate, uploadPostImage, handleUploadError, messageController.sendMessage);

// İki kullanıcı arasındaki mesajları getir
router.get('/:otherUserId', authenticate, messageController.getMessages);

module.exports = router; 