import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } })
      return res.json(products)
    }

    if (req.method === 'POST') {
      const { name, description, priceCents } = req.body
      const product = await prisma.product.create({ data: { name, description, priceCents } })
      return res.status(201).json(product)
    }

    res.status(405).json({ error: 'Method not allowed' })
  } catch (error: any) {
    console.error('Products API error:', error)
    return res.status(500).json({ error: 'Internal server error', details: error.message })
  }
}
