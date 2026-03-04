const { poolPromise } = require('../Data/db');
const User = require('../Data/User');

class UserController {
    static async getUsers(req, res) {
        try {
            const pool = await poolPromise;
            const result = await pool.request().query('SELECT UserID, FullName, Email, PasswordHash, Role, CreatedAt, IsActive FROM USERS');
            const users = result.recordset.map(row => new User(
                row.UserID,
                row.FullName,
                row.Email,
                row.PasswordHash,
                row.Role,
                row.CreatedAt,
                row.IsActive
            ));
            res.json(users);
        } catch (error) {
            console.error('Error in UserController.getUsers:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}

module.exports = UserController;
