const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Dosya yükleme için hedef klasör
const uploadDir = path.join(__dirname, '../../uploads');

// Yükleme klasörü yoksa oluştur
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Dosya depolama yapılandırması
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Benzersiz dosya adı oluştur
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// Dosya filtreleme
const fileFilter = (req, file, cb) => {
  // İzin verilen dosya türleri
  const allowedTypes = /jpeg|jpg|png|gif/;
  
  // Dosya uzantısını ve MIME türünü kontrol et
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Sadece resim dosyaları yüklenebilir (jpeg, jpg, png, gif)'));
  }
};

// Dosya boyutu limiti (5MB)
const maxSize = process.env.MAX_FILE_SIZE || 5 * 1024 * 1024;

// Multer yükleme yapılandırması
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: maxSize }
});

module.exports = {
  // Profil resmi yükleme
  uploadProfileImage: upload.single('profileImage'),
  
  // Gönderi resmi yükleme
  uploadPostImage: upload.single('image'),
  
  // Hata işleme
  handleUploadError: (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ 
          message: 'Dosya boyutu çok büyük. Maksimum 5MB olmalıdır.' 
        });
      }
      return res.status(400).json({ message: err.message });
    }
    
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    
    next();
  }
}; 