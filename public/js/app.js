// API Configuration
const API_URL = 'http://localhost:3000/api/books';

// Global State
let books = [];
let currentBookId = null;

// UI Manager Class (Handles DOM interactions)
class UIManager {
  constructor() {
    this.booksContainer = document.getElementById('booksContainer');
    this.totalBooksCount = document.getElementById('totalBooksCount');
    this.readingBooksCount = document.getElementById('readingBooksCount');
    this.readBooksCount = document.getElementById('readBooksCount');
    this.toast = document.getElementById('toast');
    this.bookForm = document.getElementById('bookForm');
    this.searchInput = document.getElementById('searchInput');
    
    this.initEventListeners();
  }

  initEventListeners() {
    // Form Submit
    this.bookForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (this.validateForm()) {
        const bookData = this.getFormData();
        if (currentBookId) {
          api.updateBook(currentBookId, bookData);
        } else {
          api.createBook(bookData);
        }
      }
    });

    // Search (Debounced)
    let timeout = null;
    this.searchInput.addEventListener('input', (e) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        api.fetchBooks(e.target.value);
      }, 500);
    });

    // Sidebar navigation
    document.getElementById('nav-all').addEventListener('click', (e) => {
      e.preventDefault();
      this.searchInput.value = '';
      api.fetchBooks();
    });

    // Delete Confirmation
    document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
      const id = document.getElementById('deleteBookId').value;
      api.deleteBook(id);
    });
  }

  openModal(modalId, bookData = null) {
    const modal = document.getElementById(modalId);
    
    if (modalId === 'addBookModal') {
      this.resetForm();
      const titleEl = document.getElementById('modalTitle');
      const submitBtn = document.getElementById('saveBookBtn');
      
      if (bookData) {
        currentBookId = bookData.id;
        titleEl.textContent = 'Kitabı Düzenle';
        submitBtn.textContent = 'Güncelle';
        
        // Fill form
        document.getElementById('title').value = bookData.title;
        document.getElementById('author').value = bookData.author;
        document.getElementById('isbn').value = bookData.isbn || '';
        document.getElementById('genre').value = bookData.genre || '';
        document.getElementById('reading_status').value = bookData.reading_status;
      } else {
        currentBookId = null;
        titleEl.textContent = 'Yeni Kitap Ekle';
        submitBtn.textContent = 'Kaydet';
      }
    }
    
    modal.classList.add('active');
  }

  closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
  }

  resetForm() {
    this.bookForm.reset();
    document.querySelectorAll('.form-group').forEach(el => el.classList.remove('error'));
    currentBookId = null;
  }

  validateForm() {
    let isValid = true;
    const title = document.getElementById('title').value.trim();
    const author = document.getElementById('author').value.trim();

    if (!title) {
      document.getElementById('title').parentElement.classList.add('error');
      isValid = false;
    } else {
      document.getElementById('title').parentElement.classList.remove('error');
    }

    if (!author) {
      document.getElementById('author').parentElement.classList.add('error');
      isValid = false;
    } else {
      document.getElementById('author').parentElement.classList.remove('error');
    }

    return isValid;
  }

  getFormData() {
    return {
      title: document.getElementById('title').value.trim(),
      author: document.getElementById('author').value.trim(),
      isbn: document.getElementById('isbn').value.trim(),
      genre: document.getElementById('genre').value.trim(),
      reading_status: document.getElementById('reading_status').value
    };
  }

  renderBooks(data) {
    books = data;
    this.updateStats();

    if (books.length === 0) {
      this.booksContainer.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-book-open"></i>
          <h3>Kitap bulunamadı</h3>
          <p>Koleksiyonunuza yeni bir kitap ekleyin veya aramanızı değiştirin.</p>
        </div>
      `;
      return;
    }

    this.booksContainer.innerHTML = books.map(book => `
      <div class="book-card">
        <div class="status-badge status-${book.reading_status.toLowerCase()}">${book.reading_status}</div>
        <div class="book-cover">
          <i class="fa-solid fa-book"></i>
        </div>
        <div class="book-info">
          <h3 class="book-title" title="${book.title}">${book.title}</h3>
          <p class="book-author"><i class="fa-solid fa-pen-nib"></i> ${book.author}</p>
          <div class="book-meta">
            ${book.genre ? `<span class="meta-item"><i class="fa-solid fa-tag"></i> ${book.genre}</span>` : ''}
            ${book.isbn ? `<span class="meta-item"><i class="fa-solid fa-barcode"></i> ${book.isbn}</span>` : ''}
          </div>
          <div class="book-actions">
            <button class="btn-icon" onclick='uiManager.editBook(${JSON.stringify(book).replace(/'/g, "&#39;")})' title="Düzenle">
              <i class="fa-solid fa-pen"></i> Düzenle
            </button>
            <button class="btn-icon delete" onclick="uiManager.confirmDelete(${book.id})" title="Sil">
              <i class="fa-solid fa-trash"></i> Sil
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }

  updateStats() {
    this.totalBooksCount.textContent = books.length;
    this.readingBooksCount.textContent = books.filter(b => b.reading_status === 'Okunuyor').length;
    this.readBooksCount.textContent = books.filter(b => b.reading_status === 'Okundu').length;
  }

  editBook(book) {
    this.openModal('addBookModal', book);
  }

  confirmDelete(id) {
    document.getElementById('deleteBookId').value = id;
    this.openModal('deleteConfirmModal');
  }

  showToast(message, type = 'success') {
    this.toast.className = `toast show ${type}`;
    const icon = this.toast.querySelector('.toast-icon i');
    
    if (type === 'success') {
      icon.className = 'fa-solid fa-check';
    } else {
      icon.className = 'fa-solid fa-triangle-exclamation';
    }
    
    this.toast.querySelector('.toast-message').textContent = message;
    
    setTimeout(() => {
      this.toast.classList.remove('show');
    }, 3000);
  }
}

// API Interaction Class
class API {
  async fetchBooks(query = '') {
    try {
      const url = query ? `${API_URL}?search=${encodeURIComponent(query)}` : API_URL;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login.html';
        return;
      }

      const data = await response.json();
      
      if (data.success) {
        uiManager.renderBooks(data.data);
      } else {
        uiManager.showToast('Kitaplar yüklenemedi', 'error');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      uiManager.showToast('Sunucuya bağlanılamadı', 'error');
    }
  }

  async createBook(bookData) {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(bookData)
      });
      
      if (response.status === 401 || response.status === 403) {
        window.location.href = '/login.html';
        return;
      }

      const data = await response.json();
      
      if (data.success) {
        uiManager.closeModal('addBookModal');
        uiManager.showToast('Kitap başarıyla eklendi');
        this.fetchBooks(uiManager.searchInput.value);
      } else {
        uiManager.showToast(data.message || 'Ekleme başarısız', 'error');
      }
    } catch (error) {
      uiManager.showToast('Sunucu hatası', 'error');
    }
  }

  async updateBook(id, bookData) {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(bookData)
      });
      
      if (response.status === 401 || response.status === 403) {
        window.location.href = '/login.html';
        return;
      }

      const data = await response.json();
      
      if (data.success) {
        uiManager.closeModal('addBookModal');
        uiManager.showToast('Kitap güncellendi');
        this.fetchBooks(uiManager.searchInput.value);
      } else {
        uiManager.showToast(data.message || 'Güncelleme başarısız', 'error');
      }
    } catch (error) {
      uiManager.showToast('Sunucu hatası', 'error');
    }
  }

  async deleteBook(id) {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.status === 401 || response.status === 403) {
        window.location.href = '/login.html';
        return;
      }

      const data = await response.json();
      
      if (data.success) {
        uiManager.closeModal('deleteConfirmModal');
        uiManager.showToast('Kitap silindi');
        this.fetchBooks(uiManager.searchInput.value);
      } else {
        uiManager.showToast(data.message || 'Silme başarısız', 'error');
      }
    } catch (error) {
      uiManager.showToast('Sunucu hatası', 'error');
    }
  }
}

// Initialize
const uiManager = new UIManager();
const api = new API();

// Load Initial Data
document.addEventListener('DOMContentLoaded', () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user.username) {
    document.getElementById('usernameDisplay').textContent = user.username;
  }

  document.getElementById('logoutBtn').addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login.html';
  });

  api.fetchBooks();
});
