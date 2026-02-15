const bcrypt = require('bcryptjs');
const { sql, poolPromise } = require('../config/db');

class AuthService {
  async register(fullName, email, password) {
    const pool = await poolPromise;

    // Kiểm tra email đã tồn tại
    const check = await pool
      .request()
      .input('email', sql.NVarChar, email)
      .query('SELECT 1 FROM Users WHERE Email = @email');

    if (check.recordset.length > 0) {
      throw new Error('Email đã được sử dụng');
    }

    // Hash mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    // Insert user
    await pool
      .request()
      .input('fullName', sql.NVarChar, fullName)
      .input('email', sql.NVarChar, email)
      .input('passwordHash', sql.NVarChar, hash)
      .input('role', sql.NVarChar, 'User')
      .input('isActive', sql.Bit, true)
      .input('emailVerified', sql.Bit, false)
      .input('createdAt', sql.DateTime, new Date())
      .query(`
        INSERT INTO Users (
          FullName, Email, PasswordHash, Role, 
          IsActive, EmailVerified, CreatedAt
        )
        VALUES (
          @fullName, @email, @passwordHash, @role,
          @isActive, @emailVerified, @createdAt
        )
      `);
  }
}

module.exports = new AuthService();