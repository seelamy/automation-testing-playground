import { useRouter } from 'next/router'
import { ReactNode, useEffect, useState } from 'react'

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [ok, setOk] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.replace('/login')
    } else {
      setOk(true)
    }
  }, [router])

  if (!ok) {
    return (
      <div data-testid="protected-loading" className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    )
  }

  return <>{children}</>
}
