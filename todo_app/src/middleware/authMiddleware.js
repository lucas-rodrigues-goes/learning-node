import jwt from 'jsonwebtoken';
import db from '../db.js';

function authMiddleware (req, res, next) {
    const token = req.headers['authorization']

    // Verify token exists
    if (!token) return res.status(401).json({message: "No token provided"});

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({message: "Invalid token"});

        // Verify if user exists in database
        try {
            const getUser = db.prepare('SELECT * FROM users WHERE id = ?');
            const user = getUser.get(decoded.id);

            // Verify if user exists
            if (!user) {
                return res.status(404).send({message: "User not found"});
            };
        } catch (err) {
            console.log(err.message);
            res.sendStatus(503);
        };

        // Pass user ID forward
        req.userId = decoded.id;
        next();
    });
}

export default authMiddleware;