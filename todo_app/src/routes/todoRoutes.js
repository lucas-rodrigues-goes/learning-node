import express from 'express';
import db from '../db.js';

const router = express.Router();

// Get for a user
router.get('/', (req, res) => {
    const getTodos = db.prepare(`SELECT * FROM todos WHERE user_id = ?`);
    const todos = getTodos.all(req.userId);
    res.json(todos);
});

// Post
router.post('/', (req, res) => {
    const {task} = req.body;
    const insertTodo = db.prepare('INSERT INTO todos (user_id, task) VALUES (?, ?)');
    insertTodo.run(req.userId, task);

    res.json({id: insertTodo.lastID, task, completed: 0 })
});

// Update
router.put('/:id', (req, res) => {
    const { completed } = req.body;
    const { id } = req.params;
    const { page } = req.query;

    const updatedTodo = db.prepare('UPDATE todos SET completed = ? WHERE id = ?');
    updatedTodo.run(completed, id);

    res.json({message: "Todo completed"});
});

// Delete
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    const deleteTodo = db.prepare('DELETE FROM todos WHERE id = ? AND user_id = ?');
    deleteTodo.run(id, req.userId);

    res.json({message: "Todo deleted"});
});

export default router;