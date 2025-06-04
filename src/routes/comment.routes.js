const express = require('express');
const router = express.Router();
const commentController = require('../controllers/comment.controller');
const { authenticate } = require('../middleware/auth.middleware');

// Gönderi yorumlarını getir
router.get('/post/:postId', commentController.getPostComments);

// Yeni yorum oluştur (kimlik doğrulama gerektirir)
router.post('/post/:postId', authenticate, commentController.createComment);

// Yorum güncelle (kimlik doğrulama gerektirir)
router.put('/:id', authenticate, commentController.updateComment);

// Yorum sil (kimlik doğrulama gerektirir)
router.delete('/:id', authenticate, commentController.deleteComment);

// Yorum beğen/beğeniyi geri al (kimlik doğrulama gerektirir)
router.post('/:id/like', authenticate, commentController.likeComment);

module.exports = router; 