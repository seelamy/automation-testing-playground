import { useState } from 'react'
import { useRouter } from 'next/router'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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

  return (
    <div data-testid="login-page" className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-blue-100">
      <div className="card p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 data-testid="login-title" className="text-2xl font-bold">🧪 Testing Sandbox</h1>
          <p className="text-gray-500 mt-2 text-sm">Sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit} data-testid="login-form" className="space-y-4">
          <div>
            <label data-testid="label-email" className="block text-sm font-medium mb-1">Email</label>
            <input
              data-testid="input-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user1@example.com"
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
              placeholder="any password (mock)"
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
        </form>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg text-xs text-gray-500">
          <p className="font-medium mb-1">Demo Credentials:</p>
          <p>Admin: <code>user1@example.com</code></p>
          <p>User: <code>user2@example.com</code> – <code>user10@example.com</code></p>
          <p className="mt-1 italic">Any password works (mock auth)</p>
        </div>
      </div>
    </div>
  )
}
