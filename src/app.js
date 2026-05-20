const express = require('express');
const cors = require('cors');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./utils/swagger');
const bookRoutes = require('./routes/bookRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Middleware'ler
app.use(cors());
app.use(express.json()); // JSON body parse
app.use(express.urlencoded({ extended: true }));

// Frontend statik dosyalarını sun
app.use(express.static(path.join(__dirname, '../public')));

// API Dokümantasyonu (Swagger)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API Route'ları
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);

// Tanımlanmayan yollar için ana sayfaya yönlendir (SPA desteği için)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

module.exports = app;
