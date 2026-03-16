import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { sendGmailOtp } from '@/lib/email';



export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { email } = req.body || {};
    if (!email || !email.endsWith('@gmail.com')) {
      return res.status(400).json({ error: 'Gmail address required' });
    }

    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: 'User already exists' });

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min expiry
    // Store OTP in DB
    await prisma.oTP.upsert({
      where: { email },
      update: { otp, expiresAt },
      create: { email, otp, expiresAt },
    });
    // Send OTP
    await sendGmailOtp(email, otp);
    return res.json({ message: 'OTP sent to Gmail' });
  } catch (error: any) {
    console.error('Signup error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message || String(error) });
  }
}
