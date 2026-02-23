// const sql = require('mssql');

// // const config = {
// //     server: 'PDN',
// //     database: 'DATN-2026',
// //     authentication: {
// //         type: 'default',
// //         options: {
// //             userName: 'DATN',
// //             password: '123'
// //         }
// //     },
// //     options: {
// //         encrypt: false, // Set to true if using Azure SQL
// //         trustServerCertificate: true // For local development
// //     }
// // };



// // Thay đổi tài khoản đăng nhập sql của máy cá nhân để test 4/2/2026
// // tài khoản của Thanh Phong
// // const config = {
// //   user: 'DATN_user',
// //   password: 'Thanhphong12042007@',
// //   server: 'localhost',
// //   database: 'DATN',
// //   port: 1433,
// //   options: {
// //     encrypt: false,
// //     trustServerCertificate: true
// //   }
// // }


// // const poolPromise = new sql.ConnectionPool(config)
// //     .connect()
// //     .then(pool => {
// //         console.log('Connected to SQL Server');
// //         return pool;
// //     })
// //     .catch(err => {
// //         console.log('Database Connection Failed! Bad Config: ', err);
// //         throw err;
// //     });

// // module.exports = {
// //     sql,
// //     poolPromise
// // };


// const sql = require('mssql');

// const config = {
//   user: 'DATN_user',
//   password: 'Thanhphong12042007@',
//   server: 'localhost',           // hoặc '127.0.0.1' nếu localhost không hoạt động
//   database: 'DATN',
//   port: 1433,                    // port mặc định của SQL Server
//   options: {
//     encrypt: false,              // false khi dùng local
//     trustServerCertificate: true // rất quan trọng cho local dev (bỏ qua cert lỗi)
//   },
//   pool: {                        // thêm pool để quản lý kết nối tốt hơn
//     max: 10,
//     min: 0,
//     idleTimeoutMillis: 30000
//   }
// };

// const poolPromise = new sql.ConnectionPool(config)
//   .connect()
//   .then(pool => {
//     console.log('✅ Connected to SQL Server - Database:', config.database);
//     return pool;
//   })
//   .catch(err => {
//     console.error('❌ Database Connection Failed!', err);
//     // Không throw ở đây để server vẫn chạy, chỉ log lỗi
//     return null;
//   });

// module.exports = {
//   sql,
//   poolPromise
// };

// 15/2/26 Thanh phong 
// Ko sài file này nữa chuyển về file ENV lưu thông tin đường dẫn kết nối sql của nodeJs
// Vì ENV bảo mật hơn và ko thể push lên git để lộ thông tin 