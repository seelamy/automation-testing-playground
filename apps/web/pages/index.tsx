import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    router.replace(token ? '/dashboard' : '/login')
  }, [router])

  return (
    <div data-testid="home-loading" className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
    </div>
  )
}
