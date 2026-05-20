const bookService = require('../services/bookService');

class BookController {
  async getAllBooks(req, res) {
    try {
      const { search } = req.query;
      const userId = req.user.id;
      const books = await bookService.getAllBooks(search, userId);
      res.json({ success: true, data: books });
    } catch (error) {
      console.error('Kitapları getirirken hata:', error);
      res.status(500).json({ success: false, message: 'Sunucu hatası oluştu.' });
    }
  }

  async getBookById(req, res) {
    try {
      const id = req.params.id;
      const userId = req.user.id;
      const book = await bookService.getBookById(id, userId);
      
      if (!book) {
        return res.status(404).json({ success: false, message: 'Kitap bulunamadı.' });
      }
      
      res.json({ success: true, data: book });
    } catch (error) {
      console.error('Kitap detayını getirirken hata:', error);
      res.status(500).json({ success: false, message: 'Sunucu hatası oluştu.' });
    }
  }

  async createBook(req, res) {
    try {
      const { title, author, isbn, genre, reading_status } = req.body;

      // Basit Backend Doğrulaması (Validation)
      if (!title || title.trim() === '') {
        return res.status(400).json({ success: false, message: 'Kitap adı zorunludur.' });
      }
      if (!author || author.trim() === '') {
        return res.status(400).json({ success: false, message: 'Yazar adı zorunludur.' });
      }

      const validStatuses = ['Okunacak', 'Okunuyor', 'Okundu'];
      if (reading_status && !validStatuses.includes(reading_status)) {
        return res.status(400).json({ success: false, message: 'Geçersiz okuma durumu.' });
      }

      const userId = req.user.id;
      const newBook = await bookService.createBook({ title, author, isbn, genre, reading_status }, userId);
      res.status(201).json({ success: true, data: newBook, message: 'Kitap başarıyla eklendi.' });
    } catch (error) {
      console.error('Kitap eklerken hata:', error);
      res.status(500).json({ success: false, message: 'Sunucu hatası oluştu.' });
    }
  }

  async updateBook(req, res) {
    try {
      const id = req.params.id;
      const { title, author, reading_status } = req.body;

      // Basit doğrulama (eğer gönderildiyse boş olmamalı)
      if (title !== undefined && title.trim() === '') {
        return res.status(400).json({ success: false, message: 'Kitap adı boş olamaz.' });
      }
      if (author !== undefined && author.trim() === '') {
        return res.status(400).json({ success: false, message: 'Yazar adı boş olamaz.' });
      }

      const validStatuses = ['Okunacak', 'Okunuyor', 'Okundu'];
      if (reading_status && !validStatuses.includes(reading_status)) {
        return res.status(400).json({ success: false, message: 'Geçersiz okuma durumu.' });
      }

      const userId = req.user.id;
      const updatedBook = await bookService.updateBook(id, req.body, userId);

      if (!updatedBook) {
        return res.status(404).json({ success: false, message: 'Güncellenecek kitap bulunamadı.' });
      }

      res.json({ success: true, data: updatedBook, message: 'Kitap başarıyla güncellendi.' });
    } catch (error) {
      console.error('Kitap güncellerken hata:', error);
      res.status(500).json({ success: false, message: 'Sunucu hatası oluştu.' });
    }
  }

  async deleteBook(req, res) {
    try {
      const id = req.params.id;
      const userId = req.user.id;
      const deleted = await bookService.deleteBook(id, userId);

      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Silinecek kitap bulunamadı.' });
      }

      res.json({ success: true, message: 'Kitap başarıyla silindi.' });
    } catch (error) {
      console.error('Kitap silerken hata:', error);
      res.status(500).json({ success: false, message: 'Sunucu hatası oluştu.' });
    }
  }
}

module.exports = new BookController();
