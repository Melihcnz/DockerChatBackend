const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { uploadProfileImage, handleUploadError } = require('../middleware/upload.middleware');

// Kullanıcı profili getir
router.get('/profile/:username', userController.getUserProfile);

// Kullanıcının gönderilerini getir
router.get('/posts/:username', userController.getUserPosts);

// Profil güncelleme (kimlik doğrulama gerektirir)
router.put('/profile', authenticate, uploadProfileImage, handleUploadError, userController.updateProfile);

// Şifre değiştirme (kimlik doğrulama gerektirir)
router.put('/change-password', authenticate, userController.changePassword);

// Kullanıcı arama
router.get('/search', userController.searchUsers);

module.exports = router; 