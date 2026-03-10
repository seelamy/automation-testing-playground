import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'
import { signToken } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { email } = req.body || {}
    if (!email) return res.status(400).json({ error: 'Email is required' })

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return res.status(401).json({ error: 'User not found' })

    // Mock auth – any password accepted
    const token = signToken({ userId: user.id, email: user.email, role: user.role })

    return res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    })
  } catch (error: any) {
    console.error('Login error:', error)
    return res.status(500).json({ error: 'Internal server error', details: error.message })
  }
}
