# Sosyal Medya Uygulaması API

Bu proje, Node.js ve Express kullanılarak oluşturulmuş bir sosyal medya uygulaması backend API'sidir.

## Özellikler

- Kullanıcı kaydı ve girişi (JWT ile kimlik doğrulama)
- Kullanıcı profili yönetimi
- Gönderi oluşturma, okuma, güncelleme ve silme
- Yorum oluşturma, okuma, güncelleme ve silme
- Gönderi ve yorumları beğenme
- Gerçek zamanlı mesajlaşma ve bildirimler (Socket.IO)
- Resim yükleme (profil ve gönderi resimleri)

## Teknolojiler

- **Node.js** - JavaScript çalışma ortamı
- **Express** - Web uygulama çerçevesi
- **MySQL** - Veritabanı
- **Sequelize** - ORM (Nesne İlişkisel Eşleyici)
- **JWT** - Kimlik doğrulama
- **Socket.IO** - Gerçek zamanlı iletişim
- **Multer** - Dosya yükleme
- **Docker** - Konteynerizasyon

## Başlangıç

### Gereksinimler

- Node.js (v18 veya üzeri)
- Docker ve Docker Compose
- Git

### Kurulum

1. Repoyu klonlayın:
   ```
   git clone https://github.com/MelihCanaz/restoran.git
   cd restoran
   ```

2. Docker Compose ile uygulamayı başlatın:
   ```
   docker-compose up -d
   ```

3. API'ye erişim:
   - API: http://localhost:5000
   - phpMyAdmin: http://localhost:8080 (kullanıcı adı: social_media_user, şifre: social_media_password)

### Uygulama Mimarisi

```
├── src/
│   ├── config/        # Yapılandırma dosyaları
│   ├── controllers/   # Controller sınıfları
│   ├── middleware/    # Middleware dosyaları
│   ├── models/        # Veritabanı modelleri
│   ├── routes/        # API rotaları
│   ├── utils/         # Yardımcı fonksiyonlar
│   ├── socket.js      # Socket.IO yapılandırması
│   └── app.js         # Ana uygulama giriş noktası
├── uploads/           # Yüklenen dosyalar
├── Dockerfile         # Docker imajı yapılandırması
├── docker-compose.yml # Docker Compose yapılandırması
├── postman_collection.json # Postman API koleksiyonu
└── package.json       # Bağımlılıklar ve komutlar
```

## API Endpoints

### Kimlik Doğrulama
- `POST /api/auth/register` - Yeni kullanıcı kaydı
- `POST /api/auth/login` - Kullanıcı girişi
- `GET /api/auth/me` - Mevcut kullanıcı bilgisini getir

### Kullanıcı
- `GET /api/users/profile/:username` - Kullanıcı profili getir
- `GET /api/users/posts/:username` - Kullanıcının gönderilerini getir
- `PUT /api/users/profile` - Profil güncelleme
- `PUT /api/users/change-password` - Şifre değiştirme
- `GET /api/users/search?query=keyword` - Kullanıcı arama

### Gönderi
- `GET /api/posts` - Tüm gönderileri getir
- `GET /api/posts/:id` - Belirli bir gönderiyi getir
- `POST /api/posts` - Yeni gönderi oluştur
- `PUT /api/posts/:id` - Gönderi güncelle
- `DELETE /api/posts/:id` - Gönderi sil
- `POST /api/posts/:id/like` - Gönderi beğen/beğeniyi geri al

### Yorum
- `GET /api/comments/post/:postId` - Gönderi yorumlarını getir
- `POST /api/comments/post/:postId` - Yeni yorum oluştur
- `PUT /api/comments/:id` - Yorum güncelle
- `DELETE /api/comments/:id` - Yorum sil
- `POST /api/comments/:id/like` - Yorum beğen/beğeniyi geri al

### Mesajlar
- `GET /api/messages/conversations` - Konuşmaları getir
- `GET /api/messages/unread/count` - Okunmamış mesaj sayısını getir
- `POST /api/messages` - Mesaj gönder
- `GET /api/messages/:otherUserId` - Belirli bir kullanıcı ile olan mesajları getir

### Bildirimler
- `GET /api/notifications` - Bildirimleri getir
- `GET /api/notifications/unread/count` - Okunmamış bildirim sayısını getir
- `PUT /api/notifications/:notificationId/read` - Bildirimi okundu olarak işaretle
- `PUT /api/notifications/read-all` - Tüm bildirimleri okundu olarak işaretle

## Socket.IO Events

- `authenticate` - Kullanıcı kimlik doğrulama
- `join_private_room` - Özel mesaj odasına katılma
- `private_message` - Özel mesaj gönderme
- `typing` - Yazıyor göstergesi
- `like_notification` - Beğeni bildirimi
- `comment_notification` - Yorum bildirimi
- `online_users` - Çevrimiçi kullanıcılar

## API Test

API'yi test etmek için, repo içerisinde bulunan `postman_collection.json` dosyasını Postman'e aktarabilirsiniz. Bu koleksiyon tüm API uç noktalarını içermektedir.

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır - detaylar için [LICENSE](LICENSE) dosyasına bakın.

Geliştiren: Melih Canaz 