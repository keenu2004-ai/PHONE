import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

const router = Router();

// GET /api/holidays - List company holidays
router.get('/', async (_req: Request, res: Response) => {
  try {
    const holidays = await prisma.holiday.findMany({
      orderBy: { date: 'asc' },
    });
    res.json(holidays);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch holidays' });
  }
});

// POST /api/holidays - Add new holiday (Admin action)
router.post('/', async (req: Request, res: Response) => {
  try {
    const { date, name } = req.body;
    if (!date || !name) {
      return res.status(400).json({ error: 'date and name are required' });
    }

    const holiday = await prisma.holiday.create({
      data: {
        date: new Date(date),
        name,
      },
    });

    res.status(201).json(holiday);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add holiday' });
  }
});

export default router;
