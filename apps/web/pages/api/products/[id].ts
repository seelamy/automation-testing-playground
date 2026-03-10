import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = Number(req.query.id)
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' })

  try {
    if (req.method === 'PUT') {
      const { name, description, priceCents } = req.body
      const product = await prisma.product.update({ where: { id }, data: { name, description, priceCents } })
      return res.json(product)
    }

    if (req.method === 'DELETE') {
      await prisma.payment.deleteMany({ where: { order: { productId: id } } })
      await prisma.order.deleteMany({ where: { productId: id } })
      await prisma.product.delete({ where: { id } })
      return res.json({ ok: true })
    }

    res.status(405).json({ error: 'Method not allowed' })
  } catch (error: any) {
    console.error('Product API error:', error)
    return res.status(500).json({ error: 'Internal server error', details: error.message })
  }
}
