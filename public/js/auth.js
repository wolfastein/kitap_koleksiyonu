document.addEventListener('DOMContentLoaded', () => {
  // Check if already logged in
  if (localStorage.getItem('token')) {
    window.location.href = '/';
    return;
  }

  const signUpButton = document.getElementById('signUp');
  const signInButton = document.getElementById('signIn');
  const container = document.getElementById('container');
  
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const toast = document.getElementById('toast');

  // Animation Toggle
  signUpButton.addEventListener('click', () => {
    container.classList.add("right-panel-active");
  });

  signInButton.addEventListener('click', () => {
    container.classList.remove("right-panel-active");
  });

  // API Call helper
  async function apiCall(url, data) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      return { success: false, message: 'Sunucuya bağlanılamadı.' };
    }
  }

  // Toast Function
  function showToast(message, type = 'success') {
    toast.className = `toast show ${type}`;
    const icon = toast.querySelector('.toast-icon i');
    
    if (type === 'success') {
      icon.className = 'fa-solid fa-check';
    } else {
      icon.className = 'fa-solid fa-triangle-exclamation';
    }
    
    toast.querySelector('.toast-message').textContent = message;
    
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }

  // Login Submit
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('log-username').value;
    const password = document.getElementById('log-password').value;

    const result = await apiCall('/api/auth/login', { username, password });
    
    if (result.success) {
      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
      showToast('Giriş başarılı, yönlendiriliyorsunuz...');
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    } else {
      showToast(result.message, 'error');
    }
  });

  // Register Submit
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;

    const result = await apiCall('/api/auth/register', { username, password });
    
    if (result.success) {
      showToast('Kayıt başarılı! Lütfen giriş yapın.');
      document.getElementById('reg-username').value = '';
      document.getElementById('reg-password').value = '';
      container.classList.remove("right-panel-active"); // Switch to login
    } else {
      showToast(result.message, 'error');
    }
  });
});
