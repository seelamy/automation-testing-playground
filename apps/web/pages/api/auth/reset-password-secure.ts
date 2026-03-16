import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { email, otp, password, currentPassword } = req.body || {};
  if (!email || !otp || !password || !currentPassword) return res.status(400).json({ error: 'Email, OTP, current password, and new password required' });
  try {
    console.log('Reset password secure request:', { email, otp, password, currentPassword });
    const otpRecord = await prisma.oTP.findUnique({ where: { email } });
    console.log('OTP record:', otpRecord);
    if (!otpRecord || otpRecord.otp !== otp) return res.status(401).json({ error: 'Invalid OTP' });
    if (otpRecord.expiresAt < new Date()) return res.status(401).json({ error: 'OTP expired' });
    const user = await prisma.user.findUnique({ where: { email } });
    console.log('User found:', user);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (!user.password) return res.status(401).json({ error: 'No password set for this user' });
    const valid = await bcrypt.compare(currentPassword, user.password);
    console.log('Current password valid:', valid);
    if (!valid) return res.status(401).json({ error: 'Invalid current password' });
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.update({ where: { email }, data: { password: hashedPassword } });
    console.log('Password updated for:', email);
    await prisma.oTP.delete({ where: { email } });
    console.log('OTP deleted for:', email);
    return res.json({ message: 'Password reset successful' });
  } catch (error: any) {
    console.error('Reset password error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
