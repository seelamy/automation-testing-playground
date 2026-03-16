import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { signToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, otp, password } = req.body || {};
  if (!email || !otp || !password) return res.status(400).json({ error: 'Email, OTP, and password required' });

  try {
    console.log('OTP verification request:', { email, otp });
    // Validate OTP from DB
    const otpRecord = await prisma.oTP.findUnique({ where: { email } });
    console.log('OTP record:', otpRecord);
    if (!otpRecord || otpRecord.otp !== otp) return res.status(401).json({ error: 'Invalid OTP' });
    if (otpRecord.expiresAt < new Date()) return res.status(401).json({ error: 'OTP expired' });

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    console.log('Existing user:', existingUser);
    if (existingUser) return res.status(409).json({ error: 'User already exists. Please log in or reset your password.' });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name: email.split('@')[0],
        password: hashedPassword,
        role: 'user',
      },
    });
    console.log('User created:', user);

    // Delete OTP record
    await prisma.oTP.delete({ where: { email } });
    console.log('OTP deleted for:', email);

    // Issue token
    const token = signToken({ userId: user.id, email: user.email, role: user.role });
    console.log('Token issued:', token);

    return res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (error: any) {
    console.error('OTP verification error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
