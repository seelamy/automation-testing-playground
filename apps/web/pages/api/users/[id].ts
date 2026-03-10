import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = Number(req.query.id)
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' })

  try {
    if (req.method === 'PUT') {
      const { name, email, role } = req.body
      const user = await prisma.user.update({ where: { id }, data: { name, email, role } })
      return res.json(user)
    }

    if (req.method === 'DELETE') {
      await prisma.payment.deleteMany({ where: { order: { userId: id } } })
      await prisma.order.deleteMany({ where: { userId: id } })
      await prisma.user.delete({ where: { id } })
      return res.json({ ok: true })
    }

    res.status(405).json({ error: 'Method not allowed' })
  } catch (error: any) {
    console.error('User API error:', error)
    return res.status(500).json({ error: 'Internal server error', details: error.message })
  }
}
