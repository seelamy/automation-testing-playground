import { useState } from 'react'
import { useRouter } from 'next/router'

export default function LoginPage() {
  const router = useRouter()
  const [tab, setTab] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  // Signup states
  const [signupEmail, setSignupEmail] = useState('')
  const [signupOtp, setSignupOtp] = useState('')
  const [signupStep, setSignupStep] = useState<'email' | 'otp' | 'password'>('email')
  const [signupPassword, setSignupPassword] = useState('')
  const [signupError, setSignupError] = useState('')
  const [signupLoading, setSignupLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Login failed')
        setLoading(false)
        return
      }
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      router.push('/dashboard')
    } catch {
      setError('Network error')
      setLoading(false)
    }
  }

  async function handleSignupEmail(e: React.FormEvent) {
    e.preventDefault()
    setSignupError('')
    setSignupLoading(true)
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: signupEmail }),
      })
      const data = await res.json()
      if (!res.ok) {
        setSignupError(data.error || 'Signup failed')
        setSignupLoading(false)
        return
      }
      setSignupStep('otp')
      setSignupLoading(false)
    } catch {
      setSignupError('Network error')
      setSignupLoading(false)
    }
  }

  async function handleSignupOtp(e: React.FormEvent) {
    e.preventDefault()
    setSignupError('')
    setSignupLoading(true)
    try {
      // OTP step now transitions to password step
      setSignupStep('password')
      setSignupLoading(false)
    } catch {
      setSignupError('Network error')
      setSignupLoading(false)
    }
  }

  return (
    <div data-testid="login-page" className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-blue-100">
      <div className="card p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 data-testid="login-title" className="text-2xl font-bold">🧪 Testing Sandbox</h1>
          <div className="flex justify-center mt-4 mb-2">
            <button
              className={`px-4 py-2 rounded-l-lg border ${tab === 'login' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
              onClick={() => setTab('login')}
              data-testid="tab-login"
            >Login</button>
            <button
              className={`px-4 py-2 rounded-r-lg border ${tab === 'signup' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
              onClick={() => setTab('signup')}
              data-testid="tab-signup"
            >Sign Up</button>
          </div>
        </div>

        {tab === 'login' && (
          <form onSubmit={handleSubmit} data-testid="login-form" className="space-y-4">
            <div>
              <label data-testid="label-email" className="block text-sm font-medium mb-1">Email</label>
              <input
                data-testid="input-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your registered email"
                className="input"
                required
              />
            </div>
            <div>
              <label data-testid="label-password" className="block text-sm font-medium mb-1">Password</label>
              <input
                data-testid="input-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="input"
                required
              />
            </div>
            {error && (
              <div data-testid="login-error" className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}
            <button
              data-testid="btn-login"
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
            <div className="mt-2 text-center">
              <a href="/reset-password" className="text-blue-600 hover:underline text-sm">Forgot password?</a>
            </div>
          </form>
        )}

        {tab === 'signup' && (
          <form
            onSubmit={
              signupStep === 'email'
                ? handleSignupEmail
                : signupStep === 'otp'
                ? handleSignupOtp
                : async (e) => {
                    e.preventDefault();
                    setSignupError('');
                    // Password validation
                    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,15}$/;
                    if (!passwordRegex.test(signupPassword)) {
                      setSignupError('Password must be 8-15 characters, include uppercase, lowercase, number, and special character.');
                      return;
                    }
                    setSignupLoading(true);
                    try {
                      const res = await fetch('/api/auth/verify-otp', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: signupEmail, otp: signupOtp, password: signupPassword }),
                      });
                      const data = await res.json();
                      if (!res.ok) {
                        setSignupError(data.error || 'Password setup failed');
                        setSignupLoading(false);
                        return;
                      }
                      localStorage.setItem('token', data.token);
                      localStorage.setItem('user', JSON.stringify(data.user));
                      router.push('/dashboard');
                    } catch {
                      setSignupError('Network error');
                      setSignupLoading(false);
                    }
                  }
            }
            data-testid="signup-form"
            className="space-y-4"
          >
            {signupStep === 'email' && (
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="Enter your Gmail address"
                  className="input"
                  required
                />
              </div>
            )}
            {signupStep === 'otp' && (
              <div>
                <label className="block text-sm font-medium mb-1">OTP</label>
                <input
                  type="text"
                  value={signupOtp}
                  onChange={(e) => setSignupOtp(e.target.value)}
                  placeholder="Enter OTP sent to Gmail"
                  className="input"
                  required
                />
              </div>
            )}
            {signupStep === 'password' && (
              <div>
                <label className="block text-sm font-medium mb-1">Set Password</label>
                <input
                  type="password"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  placeholder="Create a password"
                  className="input"
                  required
                />
                <div className="text-xs text-gray-500 mt-1">
                  Password must be 8-15 characters, include uppercase, lowercase, number, and special character.
                </div>
              </div>
            )}
            {signupError && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                {signupError}
              </div>
            )}
            <button
              type="submit"
              disabled={signupLoading}
              className="btn-primary w-full"
            >
              {signupLoading
                ? signupStep === 'email'
                  ? 'Sending OTP...'
                  : signupStep === 'otp'
                  ? 'Verifying...'
                  : 'Setting password...'
                : signupStep === 'email'
                ? 'Send OTP'
                : signupStep === 'otp'
                ? 'Verify OTP'
                : 'Set Password & Sign Up'}
            </button>
          </form>
        )}

        {/* Demo credentials removed */}
      </div>
    </div>
  )
}
