const { Pool } = require('pg');
//Database connection string
const connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@localhost:5432/${process.env.DB_NAME}`;

const pool = new Pool({
    connectionString,
});

pool.connect()
    .then(() => {
        console.log("Database connection successful");
    })
    .catch(err => {
        console.error('Database connection failed', err);
    });

module.exports = pool;
