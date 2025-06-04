const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const http = require('http');
const socketModule = require('./socket');
const initializeDatabase = require('./config/dbInit');

// Çevre değişkenlerini yükle
require('dotenv').config();

// Express uygulamasını başlat
const app = express();
const PORT = process.env.PORT || 5000;

// HTTP sunucu oluştur
const server = http.createServer(app);

// Socket.IO sunucusunu başlat
const io = socketModule.initSocketServer(server);

// IO nesnesini dışa aktar
app.set('io', io);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Statik dosyalar için dizin belirle
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API rotalarını yükle
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/posts', require('./routes/post.routes'));
app.use('/api/comments', require('./routes/comment.routes'));
app.use('/api/messages', require('./routes/message.routes'));
app.use('/api/notifications', require('./routes/notification.routes'));

// Ana rota
app.get('/', (req, res) => {
  res.json({ message: 'Sosyal Medya API\'sine Hoş Geldiniz!' });
});

// 404 hata yakalama
app.use((req, res) => {
  res.status(404).json({ message: 'Sayfa bulunamadı!' });
});

// Global hata yakalama
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Sunucu hatası!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Uygulamayı başlat
const startApp = async () => {
  try {
    // Veritabanını başlat
    const dbInitialized = await initializeDatabase();
    
    if (!dbInitialized) {
      console.error('Uygulama başlatılamadı: Veritabanı hatası');
      process.exit(1);
    }
    
    // Sunucuyu başlat
    server.listen(PORT, () => {
      console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor`);
      console.log(`Socket.IO WebSocket sunucusu aktif`);
    });
  } catch (error) {
    console.error('Uygulama başlatılırken hata oluştu:', error);
    process.exit(1);
  }
};

// Uygulamayı başlat
startApp();

module.exports = { app, io }; 