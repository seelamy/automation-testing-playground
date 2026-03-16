import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'
import { signToken } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { email, password } = req.body || {}
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' })

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return res.status(401).json({ error: 'User not found' })

    if (!user.password) return res.status(401).json({ error: 'No password set for this user' })
    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return res.status(401).json({ error: 'Invalid password' })

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
