import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

const router = Router();

// POST /api/auth/login - Authenticate user by email & password
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email address is required' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials. User not found with this email.' });
    }

    // Generate session token (e.g. base64 token encoding user ID, role, and timestamp)
    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      issuedAt: new Date().toISOString(),
    };
    const token = Buffer.from(JSON.stringify(tokenPayload)).toString('base64');

    res.json({
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        avatar_url: user.avatar_url,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// GET /api/auth/me - Get current session user profile
router.get('/me', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization token' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      return res.status(404).json({ error: 'Session user not found' });
    }

    res.json({
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      avatar_url: user.avatar_url,
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired session token' });
  }
});

export default router;
