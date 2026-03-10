import Link from 'next/link'
import { useRouter } from 'next/router'
import { ReactNode } from 'react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/users', label: 'Users', icon: '👥' },
  { href: '/products', label: 'Products', icon: '📦' },
  { href: '/payments', label: 'Payments', icon: '💳' },
]

export default function Layout({ children }: { children: ReactNode }) {
  const router = useRouter()

  function logout() {
    localStorage.removeItem('token')
    router.push('/login')
  }

  return (
    <div data-testid="layout" className="min-h-screen flex">
      {/* Sidebar */}
      <aside data-testid="sidebar" className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6 border-b border-gray-700">
          <h1 data-testid="sidebar-title" className="text-lg font-bold">🧪 Testing Sandbox</h1>
          <p className="text-xs text-gray-400 mt-1">Enterprise Edition</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              data-testid={`nav-${item.label.toLowerCase()}`}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                router.pathname === item.href
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-700">
          <button
            data-testid="btn-logout"
            onClick={logout}
            className="w-full px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors text-left"
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main data-testid="main-content" className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  )
}
