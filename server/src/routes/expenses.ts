import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

const router = Router();

// GET /api/expenses - Get expenses (optional user_id query filter)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { user_id } = req.query;
    const whereClause = user_id ? { user_id: String(user_id) } : {};

    const expenses = await prisma.expense.findMany({
      where: whereClause,
      include: {
        user: {
          select: { id: true, full_name: true, email: true, avatar_url: true, role: true },
        },
      },
      orderBy: { date: 'desc' },
    });

    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch expense claims' });
  }
});

// POST /api/expenses - Submit new expense
router.post('/', async (req: Request, res: Response) => {
  try {
    const { user_id, date, amount, category, receipt_url } = req.body;
    if (!user_id || !amount || !category) {
      return res.status(400).json({ error: 'user_id, amount, and category are required' });
    }

    const expense = await prisma.expense.create({
      data: {
        user_id,
        date: date ? new Date(date) : new Date(),
        amount: parseFloat(amount),
        category,
        receipt_url: receipt_url || '',
        status: 'PENDING',
      },
      include: { user: true },
    });

    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit expense claim' });
  }
});

// PATCH /api/expenses/:id/status - Admin update expense status
router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['APPROVED', 'REJECTED', 'PENDING'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const expense = await prisma.expense.update({
      where: { id },
      data: { status },
      include: { user: true },
    });

    res.json(expense);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update expense status' });
  }
});

export default router;
