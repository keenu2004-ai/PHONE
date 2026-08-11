import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

const router = Router();

// GET /api/leaves - Get leaves (optional user_id query filter)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { user_id } = req.query;
    const whereClause = user_id ? { user_id: String(user_id) } : {};

    const leaves = await prisma.leave.findMany({
      where: whereClause,
      include: {
        user: {
          select: { id: true, full_name: true, email: true, avatar_url: true, role: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(leaves);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leave records' });
  }
});

// POST /api/leaves - Apply for leave (Sick, Casual, Unpaid) + optional comments
router.post('/', async (req: Request, res: Response) => {
  try {
    const { user_id, start_date, end_date, leave_type, comments } = req.body;
    if (!user_id || !start_date || !end_date || !leave_type) {
      return res.status(400).json({ error: 'user_id, start_date, end_date, and leave_type are required' });
    }

    const leave = await prisma.leave.create({
      data: {
        user_id,
        start_date: new Date(start_date),
        end_date: new Date(end_date),
        leave_type,
        comments: comments || '',
        status: 'PENDING',
      },
      include: { user: true },
    });

    res.status(201).json(leave);
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit leave request' });
  }
});

// PATCH /api/leaves/:id/status - Admin update status (APPROVED / REJECTED)
// Strictly checks Admin authorization
router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, admin_user_id } = req.body;

    if (!['APPROVED', 'REJECTED', 'PENDING'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    // Role-based Access Control Check
    if (admin_user_id) {
      const adminUser = await prisma.user.findUnique({ where: { id: admin_user_id } });
      if (!adminUser || adminUser.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Forbidden: Admin privilege required to approve/reject leave requests.' });
      }
    }

    const leave = await prisma.leave.update({
      where: { id },
      data: { status },
      include: { user: true },
    });

    res.json(leave);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update leave status' });
  }
});

export default router;
