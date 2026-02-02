const sql = require('mssql');

const config = {
    server: 'PDN',
    database: 'DATN-2026',
    authentication: {
        type: 'default',
        options: {
            userName: 'DATN',
            password: '123'
        }
    },
    options: {
        encrypt: false, // Set to true if using Azure SQL
        trustServerCertificate: true // For local development
    }
};

const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log('Connected to SQL Server');
        return pool;
    })
    .catch(err => {
        console.log('Database Connection Failed! Bad Config: ', err);
        throw err;
    });

module.exports = {
    sql,
    poolPromise
};
