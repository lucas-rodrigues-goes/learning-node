import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db.js';

const router = express.Router();

// Register
router.post('/register', (req, res) => {
    const {username, password} = req.body;
    const hashedPassword = bcrypt.hashSync(password, 8);

    // Save new user in DB
    try {
        const insertUser = db.prepare(`INSERT INTO users (username, password) VALUES (?, ?)`);
        const result = insertUser.run(username, hashedPassword);

        // Add first todo for user
        const defaultTodo = `Hello! Add your first todo!`;
        const insertTodo = db.prepare(`INSERT INTO todos (user_id, task) VALUES (?, ?)`);
        insertTodo.run(result.lastInsertRowid, defaultTodo);

        // Return JWT token
        const token = jwt.sign({id: result.lastInsertRowid}, process.env.JWT_SECRET, {expiresIn: '24h'});
        res.json({ token });

    } catch (err) {
        console.log(err.message);
        res.sendStatus(503);
    };
});

// Login
router.post('/login', (req, res) => {
    const {username, password} = req.body;

    // Find user in DB
    try {
        const getUser = db.prepare('SELECT * FROM users WHERE username = ?');
        const user = getUser.get(username);

        // Verify if user exists
        if (!user) {
            return res.status(404).send({message: "User not found"});
        };

        // Verify password
        const passwordIsValid = bcrypt.compareSync(password, user.password);
        if (!passwordIsValid) {
            return res.status(401).send({message: "Invalid password"});
        };

        // Return JWT token
        const token = jwt.sign({id: user.id}, process.env.JWT_SECRET, {expiresIn: '24h'});
        res.json({ token });

    } catch (err) {
        console.log(err.message);
        res.sendStatus(503);
    };
});

export default router;