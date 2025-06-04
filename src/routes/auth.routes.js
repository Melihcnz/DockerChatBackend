const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');

// Kullanıcı kaydı
router.post('/register', authController.register);

// Kullanıcı girişi
router.post('/login', authController.login);

// Mevcut kullanıcı bilgisini getir (kimlik doğrulama gerektirir)
router.get('/me', authenticate, authController.getMe);

module.exports = router; 