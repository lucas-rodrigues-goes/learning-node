import express from 'express';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/authRoutes.js';
import todoRoutes from './routes/todoRoutes.js';
import authMiddleware from './middleware/authMiddleware.js';
import requestLogging from './middleware/requestLogging.js';

const app = express();
const PORT = process.env.PORT || 8080;

// File locations
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public'))); // Define public folder location

// Serve HTML from public
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Routes
app.use('/auth', requestLogging, authRoutes);
app.use('/todos', requestLogging, authMiddleware, todoRoutes);

// Start server
app.listen(PORT, () => {
    console.clear();
    console.log(`Server has started on port: ${PORT}`);
});