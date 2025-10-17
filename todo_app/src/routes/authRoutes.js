import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../prismaClient.js'

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
    const {username, password} = req.body;
    const hashedPassword = bcrypt.hashSync(password, 8);

    // Save new user in DB
    try {
        const user = await prisma.user.create({
            data: {
                username,
                password: hashedPassword
            }
        })

        // Add first todo for user
        const defaultTodo = `Hello! Add your first todo!`;
        await prisma.todo.create({
            data: {
                task: defaultTodo,
                userId: user.id
            }
        })

        // Return JWT token
        const token = jwt.sign({id: user.id}, process.env.JWT_SECRET, {expiresIn: '24h'});
        res.json({ token });

    } catch (err) {
        console.log(err.message);
        res.sendStatus(503);
    };
});

// Login
router.post('/login', async (req, res) => {
    const {username, password} = req.body;

    // Find user in DB
    try {
        const user = await prisma.user.findUnique({
            where: {
                username: username
            }
        })

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