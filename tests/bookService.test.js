const bookService = require('../src/services/bookService');
const db = require('../src/config/db');

// Mock db.query
jest.mock('../src/config/db', () => ({
  query: jest.fn(),
}));

describe('BookService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllBooks', () => {
    it('tüm kitapları başarıyla getirmeli', async () => {
      const mockBooks = [{ id: 1, title: 'Kitap 1' }, { id: 2, title: 'Kitap 2' }];
      db.query.mockResolvedValue([mockBooks]);

      const result = await bookService.getAllBooks();

      expect(db.query).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockBooks);
    });

    it('arama sorgusu ile kitapları getirmeli', async () => {
      const mockBooks = [{ id: 1, title: 'Test Kitabı' }];
      db.query.mockResolvedValue([mockBooks]);

      const result = await bookService.getAllBooks('Test');

      expect(db.query).toHaveBeenCalledTimes(1);
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE title LIKE ? OR author LIKE ?'),
        ['%Test%', '%Test%']
      );
      expect(result).toEqual(mockBooks);
    });
  });

  describe('createBook', () => {
    it('yeni bir kitap oluşturmalı', async () => {
      const mockBookData = { title: 'Yeni Kitap', author: 'Yazar', isbn: '1234', genre: 'Roman', reading_status: 'Okunacak' };
      db.query.mockResolvedValue([{ insertId: 5 }]);

      const result = await bookService.createBook(mockBookData);

      expect(db.query).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ id: 5, ...mockBookData });
    });
  });

  describe('getBookById', () => {
    it('var olan bir kitabı getirmeli', async () => {
      const mockBook = { id: 1, title: 'Kitap 1' };
      db.query.mockResolvedValue([[mockBook]]);

      const result = await bookService.getBookById(1);

      expect(result).toEqual(mockBook);
    });

    it('olmayan bir kitap için null dönmeli', async () => {
      db.query.mockResolvedValue([[]]);

      const result = await bookService.getBookById(99);

      expect(result).toBeNull();
    });
  });

  describe('deleteBook', () => {
    it('kitap başarıyla silindiğinde true dönmeli', async () => {
      db.query.mockResolvedValue([{ affectedRows: 1 }]);

      const result = await bookService.deleteBook(1);

      expect(result).toBe(true);
    });

    it('silinecek kitap bulunamadığında false dönmeli', async () => {
      db.query.mockResolvedValue([{ affectedRows: 0 }]);

      const result = await bookService.deleteBook(99);

      expect(result).toBe(false);
    });
  });
});
