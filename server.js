const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');
const app = express();

require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

const JWT_SECRET = process.env.JWT_SECRET;

app.use(express.json());
app.use(express.static('public'));

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// User Registration
app.post('/register', (req, res) => {
    const { username, password } = req.body;
    bcrypt.hash(password, 10, (err, hash) => {
        if (err) return res.status(500).send('Error registering user');
        pool.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hash], (error, results) => {
            if (error) return res.status(500).send('Error registering user');
            res.status(200).send('User registered successfully');
        });
    });
});

// User Login
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    pool.query('SELECT * FROM users WHERE username = ?', [username], (error, results) => {
        if (error) return res.status(500).send('Error logging in');
        if (results.length === 0) return res.status(400).send('User not found');
        
        const user = results[0];
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) return res.status(500).send('Error logging in');
            if (!isMatch) return res.status(400).send('Invalid password');
            
            const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
            res.status(200).json({ token });
        });
    });
});

// Middleware to authenticate token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Upload Song
app.post('/upload', authenticateToken, upload.single('song'), (req, res) => {
    const { title, artist } = req.body;
    const songPath = req.file.path;
    const userId = req.user.userId;

    pool.query('INSERT INTO songs (title, artist, path, user_id) VALUES (?, ?, ?, ?)', [title, artist, songPath, userId], (error, results) => {
        if (error) return res.status(500).send('Error uploading song');
        res.status(200).send('Song uploaded successfully');
    });
});

// Fetch Songs
app.get('/songs', (req, res) => {
    pool.query('SELECT * FROM songs', (error, results) => {
        if (error) return res.status(500).send('Error fetching songs');
        res.status(200).json(results);
    });
});

// Serve uploaded songs
app.get('/uploads/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'uploads', filename);
    res.sendFile(filePath);
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
