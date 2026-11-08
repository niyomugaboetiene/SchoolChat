const mysql = require("mysql2");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    ssl: {
        ca: fs.readFileSync(
          path.join(__dirname, "../certificates/ca.pem")
        ),
        rejectUnauthorized: true
    },

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

pool.getConnection((err, connection) => {
    if (err) {
        console.error("Database connection failed!");
        console.error("Error code:", err.code);
        console.error("Error message:", err.message);
        console.error("Full error:", err);
        return;
    }

    console.log("Successfully connected to Aiven MySQL Database!");

    connection.release();
});