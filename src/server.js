require('dotenv').config();
const app = require('./app');
const db = require('./config/db');

const PORT = process.env.PORT || 3000;

// Veritabanı bağlantısını kontrol et ve sunucuyu başlat
async function startServer() {
  try {
    const connection = await db.getConnection();
    console.log('✅ Veritabanına başarıyla bağlanıldı.');
    connection.release();

    app.listen(PORT, () => {
      console.log(`🚀 Sunucu çalışıyor: http://localhost:${PORT}`);
      console.log(`📚 Swagger Dokümantasyonu: http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error('❌ Veritabanı bağlantı hatası:', error.message);
    console.log('Lütfen MySQL/XAMPP sunucunuzun çalıştığından emin olun.');
    // Geliştirme ortamında veritabanı yoksa bile sunucu başlasın (UI testi için)
    app.listen(PORT, () => {
      console.log(`⚠️ Sunucu veritabanı OLMADAN çalışıyor: http://localhost:${PORT}`);
    });
  }
}

startServer();
