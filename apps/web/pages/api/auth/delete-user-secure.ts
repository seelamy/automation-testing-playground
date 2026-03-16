import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (!user.password) return res.status(401).json({ error: 'No password set for this user' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid password' });
    await prisma.user.delete({ where: { email } });
    try { await prisma.oTP.delete({ where: { email } }); } catch {}
    return res.json({ message: 'User deleted', email });
  } catch (error: any) {
    console.error('Delete user error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
