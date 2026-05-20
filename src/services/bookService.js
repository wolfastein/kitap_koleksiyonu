const db = require('../config/db');

class BookService {
  async getAllBooks(searchQuery = '', userId) {
    let query = 'SELECT * FROM books WHERE user_id = ?';
    let params = [userId];

    if (searchQuery) {
      query += ' AND (title LIKE ? OR author LIKE ?)';
      const likeParam = `%${searchQuery}%`;
      params.push(likeParam, likeParam);
    }

    query += ' ORDER BY created_at DESC';

    const [rows] = await db.query(query, params);
    return rows;
  }

  async getBookById(id, userId) {
    const [rows] = await db.query('SELECT * FROM books WHERE id = ? AND user_id = ?', [id, userId]);
    if (rows.length === 0) return null;
    return rows[0];
  }

  async createBook(bookData, userId) {
    const { title, author, isbn, genre, reading_status } = bookData;
    const query = 'INSERT INTO books (user_id, title, author, isbn, genre, reading_status) VALUES (?, ?, ?, ?, ?, ?)';
    const status = reading_status || 'Okunacak';
    const [result] = await db.query(query, [userId, title, author, isbn || null, genre || null, status]);
    
    return { id: result.insertId, ...bookData, reading_status: status };
  }

  async updateBook(id, bookData, userId) {
    // Önce kitabın var olup olmadığını ve bu kullanıcıya ait olup olmadığını kontrol et
    const existingBook = await this.getBookById(id, userId);
    if (!existingBook) return null;

    const { title, author, isbn, genre, reading_status } = bookData;
    
    // Güncellenecek alanları belirle (sadece gönderilenleri güncelle)
    const updates = [];
    const params = [];

    if (title !== undefined) { updates.push('title = ?'); params.push(title); }
    if (author !== undefined) { updates.push('author = ?'); params.push(author); }
    if (isbn !== undefined) { updates.push('isbn = ?'); params.push(isbn); }
    if (genre !== undefined) { updates.push('genre = ?'); params.push(genre); }
    if (reading_status !== undefined) { updates.push('reading_status = ?'); params.push(reading_status); }

    if (updates.length === 0) return existingBook; // Güncellenecek veri yok

    const query = `UPDATE books SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`;
    params.push(id, userId);

    await db.query(query, params);

    return await this.getBookById(id, userId);
  }

  async deleteBook(id, userId) {
    const [result] = await db.query('DELETE FROM books WHERE id = ? AND user_id = ?', [id, userId]);
    return result.affectedRows > 0;
  }
}

module.exports = new BookService();
