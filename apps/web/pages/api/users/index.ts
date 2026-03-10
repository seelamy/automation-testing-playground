import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } })
      return res.json(users)
    }

    if (req.method === 'POST') {
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
