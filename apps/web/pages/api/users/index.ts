import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Require authentication and admin role for all actions except GET
  const { authorization } = req.headers;
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = authorization.slice(7);
  const payload = require('@/lib/auth').verifyToken(token);
  if (!payload) return res.status(401).json({ error: 'Invalid token' });

  try {
    if (req.method === 'GET') {
      // Only admins can view all users
      if (payload.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
      const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } })
      return res.json(users)
    }

    if (req.method === 'POST') {
      // Only admins can create users
      if (payload.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
      const { name, email, role } = req.body
      const user = await prisma.user.create({ data: { name, email, role: role || 'USER' } })
      return res.status(201).json(user)
    }

    res.status(405).json({ error: 'Method not allowed' })
  } catch (error: any) {
    console.error('Users API error:', error)
    return res.status(500).json({ error: 'Internal server error', details: error.message })
  }
}
