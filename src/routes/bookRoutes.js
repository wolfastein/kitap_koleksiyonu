const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const { verifyToken } = require('../middleware/authMiddleware');

// Tüm kitap rotalarını koruma altına al
router.use(verifyToken);

/**
 * @swagger
 * components:
 *   schemas:
 *     Book:
 *       type: object
 *       required:
 *         - title
 *         - author
 *       properties:
 *         id:
 *           type: integer
 *           description: Kitabın otomatik oluşturulan ID'si
 *         title:
 *           type: string
 *           description: Kitabın adı
 *         author:
 *           type: string
 *           description: Kitabın yazarı
 *         isbn:
 *           type: string
 *           description: ISBN numarası
 *         genre:
 *           type: string
 *           description: Kitabın türü
 *         reading_status:
 *           type: string
 *           enum: [Okunacak, Okunuyor, Okundu]
 *           description: Okuma durumu
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Eklenme tarihi
 */

/**
 * @swagger
 * /api/books:
 *   get:
 *     summary: Tüm kitapları listeler
 *     tags: [Books]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Kitap adı veya yazara göre arama
 *     responses:
 *       200:
 *         description: Kitap listesi başarıyla getirildi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Book'
 */
router.get('/', bookController.getAllBooks.bind(bookController));

/**
 * @swagger
 * /api/books/{id}:
 *   get:
 *     summary: ID'ye göre kitap getirir
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Kitap ID'si
 *     responses:
 *       200:
 *         description: Kitap detayı
 *       404:
 *         description: Kitap bulunamadı
 */
router.get('/:id', bookController.getBookById.bind(bookController));

/**
 * @swagger
 * /api/books:
 *   post:
 *     summary: Yeni kitap ekler
 *     tags: [Books]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - author
 *             properties:
 *               title:
 *                 type: string
 *               author:
 *                 type: string
 *               isbn:
 *                 type: string
 *               genre:
 *                 type: string
 *               reading_status:
 *                 type: string
 *                 enum: [Okunacak, Okunuyor, Okundu]
 *     responses:
 *       201:
 *         description: Kitap eklendi
 *       400:
 *         description: Eksik veya hatalı bilgi
 */
router.post('/', bookController.createBook.bind(bookController));

/**
 * @swagger
 * /api/books/{id}:
 *   put:
 *     summary: Kitap bilgilerini günceller
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               author:
 *                 type: string
 *               isbn:
 *                 type: string
 *               genre:
 *                 type: string
 *               reading_status:
 *                 type: string
 *                 enum: [Okunacak, Okunuyor, Okundu]
 *     responses:
 *       200:
 *         description: Kitap güncellendi
 *       404:
 *         description: Kitap bulunamadı
 */
router.put('/:id', bookController.updateBook.bind(bookController));

/**
 * @swagger
 * /api/books/{id}:
 *   delete:
 *     summary: Kitap siler
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Kitap silindi
 *       404:
 *         description: Kitap bulunamadı
 */
router.delete('/:id', bookController.deleteBook.bind(bookController));

module.exports = router;
