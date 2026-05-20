const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'gizli_anahtar_degistir_lutfen';

class AuthController {
  async register(req, res) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Kullanıcı adı ve şifre zorunludur.' });
      }

      // Check if user exists
      const [existingUsers] = await db.query('SELECT id FROM users WHERE username = ?', [username]);
      if (existingUsers.length > 0) {
        return res.status(400).json({ success: false, message: 'Bu kullanıcı adı zaten alınmış.' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert user
      const [result] = await db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);

      res.status(201).json({ success: true, message: 'Kayıt başarılı! Şimdi giriş yapabilirsiniz.' });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ success: false, message: 'Sunucu hatası oluştu.' });
    }
  }

  async login(req, res) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Kullanıcı adı ve şifre zorunludur.' });
      }

      // Find user
      const [users] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
      if (users.length === 0) {
        return res.status(401).json({ success: false, message: 'Geçersiz kullanıcı adı veya şifre.' });
      }

      const user = users[0];

      // Compare password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Geçersiz kullanıcı adı veya şifre.' });
      }

      // Generate JWT
      const token = jwt.sign(
        { id: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(200).json({
        success: true,
        message: 'Giriş başarılı.',
        token,
        user: { id: user.id, username: user.username }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ success: false, message: 'Sunucu hatası oluştu.' });
    }
  }
}

module.exports = new AuthController();
