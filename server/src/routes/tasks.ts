import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

const router = Router();

// GET /api/tasks - Get tasks (optional user_id query filter)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { user_id } = req.query;
    const whereClause = user_id ? { user_id: String(user_id) } : {};

    const tasks = await prisma.task.findMany({
      where: whereClause,
      include: {
        user: {
          select: { id: true, full_name: true, email: true, avatar_url: true, role: true },
        },
      },
      orderBy: { due_date: 'asc' },
    });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// POST /api/tasks - Create task
router.post('/', async (req: Request, res: Response) => {
  try {
    const { user_id, due_date, title } = req.body;
    if (!user_id || !title || !due_date) {
      return res.status(400).json({ error: 'user_id, title, and due_date are required' });
    }

    const task = await prisma.task.create({
      data: {
        user_id,
        due_date: new Date(due_date),
        title,
        status: 'TODO',
      },
      include: { user: true },
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// PATCH /api/tasks/:id/status - Toggle or update task status
router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['TODO', 'DONE'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be TODO or DONE' });
    }

    const task = await prisma.task.update({
      where: { id },
      data: { status },
      include: { user: true },
    });

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update task status' });
  }
});

export default router;
