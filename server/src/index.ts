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

// Candidate paths for client/dist across different deployment directory layouts
const candidatePaths = [
  path.join(__dirname, '../../client/dist'),
  path.join(__dirname, '../client/dist'),
  path.join(process.cwd(), 'client/dist'),
  path.join(process.cwd(), '../client/dist'),
  path.resolve('client/dist'),
  path.resolve('../client/dist'),
];

const clientDistPath = candidatePaths.find((p) => fs.existsSync(p)) || '';

if (clientDistPath) {
  console.log(`✅ Serving TeamNest React frontend from: ${clientDistPath}`);
  app.use(express.static(clientDistPath));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  console.warn('⚠️ client/dist not found in candidate paths:', candidatePaths);

  app.get('/', (_req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>TeamNest Workforce OS</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: #0B0F19; color: #F9FAFB; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
            .card { background: rgba(19, 26, 42, 0.8); padding: 40px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); max-width: 480px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
            h1 { color: #6366F1; margin-bottom: 8px; }
            p { color: #9CA3AF; font-size: 14px; margin-bottom: 24px; }
            a { display: inline-block; background: #6366F1; color: #FFF; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; font-size: 14px; }
          </style>
        </head>
        <body>
          <div className="card">
            <h1>🚀 TeamNest API Active</h1>
            <p>The backend REST API server is live. Static client bundle is syncing...</p>
            <a href="/api/health">Check API Health (/api/health)</a>
          </div>
        </body>
      </html>
    `);
  });
}

app.listen(PORT, () => {
  console.log(`🚀 TeamNest Express server running on http://localhost:${PORT}`);
});
