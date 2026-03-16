import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { sendGmailOtp } from '@/lib/email';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { email, otp, password } = req.body || {};
  console.log('Reset password request:', { email, otp, password });

  // Step 1: Send OTP
  if (email && !otp && !password) {
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) return res.status(404).json({ error: 'User not found' });
      // Generate OTP
      const otpValue = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min expiry
      await prisma.oTP.upsert({
        where: { email },
        update: { otp: otpValue, expiresAt },
        create: { email, otp: otpValue, expiresAt },
      });
      await sendGmailOtp(email, otpValue);
      return res.json({ message: 'OTP sent to email' });
    } catch (error: any) {
      console.error('Reset password OTP error:', error);
      return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  }

  // Step 2: Reset password
  if (email && otp && password) {
    try {
      console.log('Reset password request:', { email, otp, password });
      const otpRecord = await prisma.oTP.findUnique({ where: { email } });
      console.log('OTP record:', otpRecord);
      if (!otpRecord || otpRecord.otp !== otp) return res.status(401).json({ error: 'Invalid OTP' });
      if (otpRecord.expiresAt < new Date()) return res.status(401).json({ error: 'OTP expired' });
      const user = await prisma.user.findUnique({ where: { email } });
      console.log('User found:', user);
      if (!user) return res.status(404).json({ error: 'User not found' });
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

  // Invalid request
  return res.status(400).json({ error: 'Invalid request. Provide email to send OTP, or email, OTP, and new password to reset.' });
}

export async function sendOtpForPasswordReset(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: 'Email required' });
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min expiry
    await prisma.oTP.upsert({
      where: { email },
      update: { otp, expiresAt },
      create: { email, otp, expiresAt },
    });
    await sendGmailOtp(email, otp);
    return res.json({ message: 'OTP sent to email' });
  } catch (error: any) {
    console.error('Reset password OTP error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
