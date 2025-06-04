FROM node:18-alpine

# Çalışma dizinini oluştur
WORKDIR /app

# package.json ve package-lock.json dosyalarını kopyala
COPY package*.json ./

# Bağımlılıkları yükle
RUN npm install

# Uygulamanın geri kalanını kopyala
COPY . .

# uploads klasörünü oluştur
RUN mkdir -p uploads

# 5000 portunu dışa aç
EXPOSE 5000

# Uygulamayı başlat
CMD ["npm", "start"] 