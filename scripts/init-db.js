const mysql = require('mysql2/promise');
require('dotenv').config();

async function initDatabase() {
  try {
    // Veritabanı olmadan bağlan (veritabanı oluşturmak için)
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
    });

    const dbName = process.env.DB_NAME || 'book_collection_db';

    console.log(`Veritabanı kontrol ediliyor/oluşturuluyor: ${dbName}`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    
    // Oluşturulan/Var olan veritabanına bağlan
    await connection.changeUser({ database: dbName });

    // Eski tabloları temizle (çakışmaları önlemek için)
    console.log('Eski tablolar temizleniyor...');
    await connection.query('DROP TABLE IF EXISTS \`books\`;');
    await connection.query('DROP TABLE IF EXISTS \`users\`;');

    // users tablosunu oluştur
    console.log('Tablo oluşturuluyor: users');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`users\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`username\` VARCHAR(50) NOT NULL UNIQUE,
        \`password\` VARCHAR(255) NOT NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // books tablosunu oluştur
    console.log('Tablo oluşturuluyor: books');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`books\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`user_id\` INT NOT NULL,
        \`title\` VARCHAR(255) NOT NULL,
        \`author\` VARCHAR(255) NOT NULL,
        \`isbn\` VARCHAR(20),
        \`genre\` VARCHAR(100),
        \`reading_status\` ENUM('Okunacak', 'Okunuyor', 'Okundu') DEFAULT 'Okunacak',
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log('Veritabanı başlatma başarıyla tamamlandı!');
    await connection.end();
  } catch (error) {
    console.error('Veritabanı başlatma sırasında hata oluştu:');
    console.error(error);
    process.exit(1);
  }
}

initDatabase();
