const sql = require('mssql');
require('dotenv').config();

const config = {
    server: process.env.DB_SERVER || 'localhost',
    database: process.env.DB_NAME || 'University_HR_ManagementSystem',
    options: {
        trustedConnection: true,
        trustServerCertificate: true
    }
};

const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log('✅ Connected to SQL Server');
        return pool;
    })
    .catch(err => {
        console.log('❌ Database Connection Failed!', err);
        process.exit(1);
    });

module.exports = { sql, poolPromise };