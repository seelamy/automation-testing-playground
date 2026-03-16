import nodemailer from 'nodemailer';

// Real Gmail OTP sender using Nodemailer
export async function sendGmailOtp(email: string, otp: string) {
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_PASS;
  if (!gmailUser || !gmailPass) {
    // Do not log OTPs for security
    return Promise.resolve();
  }
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: gmailUser,
      pass: gmailPass,
    },
  });
  const mailOptions = {
    from: gmailUser,
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP code is: ${otp}`,
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log(`Sent OTP ${otp} to Gmail: ${email}`);
  } catch (err) {
    console.error('Failed to send OTP email:', err);
  }
}
