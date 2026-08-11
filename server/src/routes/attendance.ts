import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

const router = Router();

// GET /api/attendance - List attendance (optional user_id query filter)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { user_id } = req.query;
    const whereClause = user_id ? { user_id: String(user_id) } : {};

    const attendance = await prisma.attendance.findMany({
      where: whereClause,
      include: {
        user: {
          select: { id: true, full_name: true, email: true, avatar_url: true, role: true },
        },
      },
      orderBy: { date: 'desc' },
    });

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch attendance records' });
  }
});

// POST /api/attendance/clock-in - Clock in
router.post('/clock-in', async (req: Request, res: Response) => {
  try {
    const { user_id, check_in_lat, check_in_lng } = req.body;
    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' });
    }

    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const endOfDay = new Date(now.setHours(23, 59, 59, 999));

    // Check if already clocked in today
    const existing = await prisma.attendance.findFirst({
      where: {
        user_id,
        date: { gte: startOfDay, lte: endOfDay },
      },
    });

    if (existing) {
      return res.status(400).json({ error: 'Already clocked in today', attendance: existing });
    }

    const record = await prisma.attendance.create({
      data: {
        user_id,
        date: new Date(),
        clock_in: new Date(),
        check_in_lat: check_in_lat ? parseFloat(check_in_lat) : null,
        check_in_lng: check_in_lng ? parseFloat(check_in_lng) : null,
        status: 'PRESENT',
      },
      include: { user: true },
    });

    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ error: 'Clock in failed' });
  }
});

// POST /api/attendance/clock-out - Clock out
router.post('/clock-out', async (req: Request, res: Response) => {
  try {
    const { user_id, attendance_id } = req.body;
    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' });
    }

    let record;
    if (attendance_id) {
      record = await prisma.attendance.findUnique({ where: { id: attendance_id } });
    } else {
      const now = new Date();
      const startOfDay = new Date(now.setHours(0, 0, 0, 0));
      const endOfDay = new Date(now.setHours(23, 59, 59, 999));

      record = await prisma.attendance.findFirst({
        where: {
          user_id,
          date: { gte: startOfDay, lte: endOfDay },
          clock_out: null,
        },
      });
    }

    if (!record) {
      return res.status(404).json({ error: 'Active clock-in record not found for today' });
    }

    const updated = await prisma.attendance.update({
      where: { id: record.id },
      data: { clock_out: new Date() },
      include: { user: true },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Clock out failed' });
  }
});

export default router;
