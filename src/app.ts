import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import mysql from 'mysql2';
import cors from 'cors'; // Add this line

import { index } from '../serve/index';
import { RowDataPacket } from 'mysql2';

const app = express();
const port = 1545;

app.use(cors());

dotenv.config();

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect(err => {
    if (err) throw err;
    console.log('Connected to the database!');

    const createTableSql = `
        CREATE TABLE IF NOT EXISTS kiku (
            id INT AUTO_INCREMENT PRIMARY KEY,
            uid VARCHAR(255) NOT NULL,
            data LONGTEXT NOT NULL
        )
    `;

    db.query(createTableSql, function(err, results, fields) {
        if (err) throw err;
        console.log('Table created!');

        const alterTableSql = `
            ALTER TABLE kiku ADD UNIQUE (uid);
        `;

        db.query(alterTableSql, function(err, results, fields) {
            if (err) throw err;
            console.log('Table altered!');
        });
    });
});

app.get('/', (req, res) => { 
    res.send(index); 
});

app.get('/setup', (req, res) => { 
    res.redirect('https://github.com/kittenzexe/kiku');
});

app.get('/v1/:uid', (req, res) => {
    const uid = req.params.uid;

    const sql = 'SELECT data FROM kiku WHERE uid = ?';
    db.query(sql, [uid], (err, results: RowDataPacket[]) => {
        if (err) throw err;

        if (Array.isArray(results) && results.length > 0) {
            res.json(JSON.parse(results[0].data));
        } else {
            res.status(404).send('User not found');
        }
    });
});

app.listen(port, () => {
    console.log(`Running at http://localhost:${port}`);
});

// what are comments?