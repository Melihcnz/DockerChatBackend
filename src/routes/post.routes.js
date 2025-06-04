const express = require('express');
const router = express.Router();
const postController = require('../controllers/post.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { uploadPostImage, handleUploadError } = require('../middleware/upload.middleware');

// Tüm gönderileri getir
router.get('/', postController.getAllPosts);

// Belirli bir gönderiyi getir
router.get('/:id', postController.getPostById);

// Yeni gönderi oluştur (kimlik doğrulama gerektirir)
router.post('/', authenticate, uploadPostImage, handleUploadError, postController.createPost);

// Gönderi güncelle (kimlik doğrulama gerektirir)
router.put('/:id', authenticate, uploadPostImage, handleUploadError, postController.updatePost);

// Gönderi sil (kimlik doğrulama gerektirir)
router.delete('/:id', authenticate, postController.deletePost);

// Gönderi beğen/beğeniyi geri al (kimlik doğrulama gerektirir)
router.post('/:id/like', authenticate, postController.likePost);

module.exports = router; 