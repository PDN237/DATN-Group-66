const sql = require('mssql');

// SQL Server configuration - Using SQL Server Authentication
const config = {
  server: 'DESKTOP-GCTEUK8',
  database: 'DATN',
  user: 'DATN',
  password: '1234',
  options: {
    encrypt: true,
    trustServerCertificate: true,
    enableArithAbort: true
  }
};

// Create connection pool - export as poolPromise for compatibility with controllers
const poolPromise = sql.connect(config)
  .then(pool => {
    console.log('✅ Kết nối SQL Server thành công!');
    return pool;
  })
  .catch(err => {
    console.error('❌ Lỗi kết nối SQL Server:', err.message);
    throw err;
  });

// Function to get connection pool
async function getConnection() {
  try {
    return await poolPromise;
  } catch (err) {
    console.error('❌ Lỗi kết nối SQL Server:', err.message);
    throw err;
  }
}

// Function to execute query
async function executeQuery(query, params = []) {
  try {
    const pool = await getConnection();
    const request = pool.request();
    
    // Add parameters if provided
    for (let i = 0; i < params.length; i++) {
      request.input(`param${i}`, params[i].type, params[i].value);
    }
    
    const result = await request.query(query);
    return result.recordset;
  } catch (err) {
    console.error('❌ Lỗi thực thi query:', err.message);
    throw err;
  }
}

// Function to close connection
async function closeConnection() {
  try {
    const pool = await poolPromise;
    if (pool) {
      await pool.close();
      console.log('✅ Đóng kết nối SQL Server thành công!');
    }
  } catch (err) {
    console.error('❌ Lỗi đóng kết nối:', err.message);
  }
}

// Export functions and sql
module.exports = {
  poolPromise,
  getConnection,
  executeQuery,
  closeConnection,
  sql
};
