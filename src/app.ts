import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import mysql from 'mysql2';
import cors from 'cors';
import http from 'http';
import WebSocket from 'ws';
import { parse } from 'url';

import { index } from '../serve/index';
import { user } from '../serve/user';
import { RowDataPacket } from 'mysql2';

const app = express();
const port = 1545;

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

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

app.get('/v1/user/:uid', (req, res) => {
    const uid = req.params.uid;
    res.send(user(uid));
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

wss.on('connection', (ws, req) => {
    const pathComponents = parse(req.url as string).pathname?.split('/');
    const uid = pathComponents && pathComponents[pathComponents.length - 1];

    if (!uid) {
        ws.close(1008, 'Invalid request URL');
        return;
    }

    const sendData = () => {
        const sql = 'SELECT data FROM kiku WHERE uid = ?';
        db.query(sql, [uid], (err, results: RowDataPacket[]) => {
            if (err) throw err;

            if (Array.isArray(results) && results.length > 0) {
                ws.send(JSON.stringify(JSON.parse(results[0].data)));
            } else {
                ws.send(JSON.stringify({ error: 'User not found' }));
            }
        });
    };

    const intervalId = setInterval(sendData, 1000);

    ws.on('close', () => {
        clearInterval(intervalId);
    });
});

server.listen(port, () => {
    console.log(`HTTP and WebSocket server running at http://localhost:${port}`);
});

// what are comments?