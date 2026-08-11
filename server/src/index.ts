import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

import usersRouter from './routes/users.js';
import authRouter from './routes/auth.js';
import attendanceRouter from './routes/attendance.js';
import leavesRouter from './routes/leaves.js';
import expensesRouter from './routes/expenses.js';
import tasksRouter from './routes/tasks.js';
import holidaysRouter from './routes/holidays.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Path to compiled React frontend build in client/dist
const clientDistPath = path.join(__dirname, '../../client/dist');

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/attendance', attendanceRouter);
app.use('/api/leaves', leavesRouter);
app.use('/api/expenses', expensesRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/holidays', holidaysRouter);

// Health Check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'TeamNest API Server', timestamp: new Date().toISOString() });
});

// Serve static frontend React app if client/dist exists
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 TeamNest Express server running on http://localhost:${PORT}`);
});
