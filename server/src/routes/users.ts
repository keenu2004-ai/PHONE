import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

const router = Router();

// GET /api/users - Get all users
router.get('/', async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { full_name: 'asc' },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// GET /api/users/:id - Get single user with relations
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        attendances: { take: 5, orderBy: { date: 'desc' } },
        leaves: { take: 5, orderBy: { createdAt: 'desc' } },
        expenses: { take: 5, orderBy: { date: 'desc' } },
        tasks: { take: 5, orderBy: { due_date: 'asc' } },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// POST /api/users - Create new user
router.post('/', async (req: Request, res: Response) => {
  try {
    const { full_name, email, role, avatar_url } = req.body;
    if (!full_name || !email) {
      return res.status(400).json({ error: 'full_name and email are required' });
    }

    const user = await prisma.user.create({
      data: {
        full_name,
        email,
        role: role || 'EMPLOYEE',
        avatar_url: avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      },
    });

    res.status(201).json(user);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Failed to create user' });
  }
});

export default router;
