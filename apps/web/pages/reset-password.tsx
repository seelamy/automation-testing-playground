import { useState } from 'react';
import { useRouter } from 'next/router';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'otp' | 'password' | 'success'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to send OTP');
        setLoading(false);
        return;
      }
      setStep('otp');
      setLoading(false);
    } catch {
      setError('Network error');
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    // For demo, just move to password step
    setStep('password');
    setLoading(false);
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    // Password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,15}$/;
    if (!passwordRegex.test(password)) {
      setError('Password must be 8-15 characters, include uppercase, lowercase, number, and special character.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Password reset failed');
        setLoading(false);
        return;
      }
      setStep('success');
      setLoading(false);
    } catch {
      setError('Network error');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-blue-100">
      <div className="card p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">Reset Password</h1>
        {step === 'email' && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your Gmail address"
                className="input"
                required
              />
            </div>
            {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</div>}
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        )}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP sent to Gmail"
                className="input"
                required
              />
            </div>
            {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</div>}
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Verifying...' : 'Next'}
            </button>
          </form>
        )}
        {step === 'password' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">New Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                className="input"
                required
              />
            </div>
            {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</div>}
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}
        {step === 'success' && (
          <div className="text-green-600 text-sm bg-green-50 p-3 rounded-lg text-center">
            Password reset successful! You can now log in with your new password.
            <br />
            <a href="/login" className="text-blue-600 hover:underline mt-4 inline-block">Go to Login</a>
          </div>
        )}
      </div>
    </div>
  );
}
