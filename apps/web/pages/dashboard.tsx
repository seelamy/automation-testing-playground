import { GetServerSideProps } from 'next'
import Layout from '@/components/Layout'
import ProtectedRoute from '@/components/ProtectedRoute'
import StatsCard from '@/components/StatsCard'
import prisma from '@/lib/prisma'
import { formatCents, formatDate } from '@/lib/utils'

interface DashboardProps {
  stats: { users: number; products: number; orders: number; revenue: number }
  recentActivity: Array<{
    id: number
    userName: string
    productName: string
    amount: number
    status: string
    date: string
  }>
}

export default function DashboardPage({ stats, recentActivity }: DashboardProps) {
  return (
    <ProtectedRoute>
      <Layout>
        <div data-testid="dashboard-page">
          <h1 data-testid="dashboard-title" className="text-2xl font-bold mb-6">Dashboard</h1>

          {/* Stats Grid */}
          <div data-testid="stats-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard testId="stat-users" title="Total Users" value={stats.users} icon="👥" change="+12% this month" />
            <StatsCard testId="stat-products" title="Products" value={stats.products} icon="📦" change="+3 new" />
            <StatsCard testId="stat-orders" title="Orders" value={stats.orders} icon="🛒" change="+8% this week" />
            <StatsCard testId="stat-revenue" title="Revenue" value={formatCents(stats.revenue)} icon="💰" change="+15% growth" />
          </div>

          {/* Recent Activity */}
          <div className="card" data-testid="recent-activity">
            <div className="px-6 py-4 border-b">
              <h2 data-testid="activity-title" className="text-lg font-semibold">Recent Activity</h2>
            </div>
            <div className="overflow-x-auto">
              <table data-testid="activity-table" className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivity.map((item) => (
                    <tr key={item.id} data-testid={`activity-row-${item.id}`} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm">{item.userName}</td>
                      <td className="px-6 py-4 text-sm">{item.productName}</td>
                      <td className="px-6 py-4 text-sm font-medium">{formatCents(item.amount)}</td>
                      <td className="px-6 py-4">
                        <span
                          data-testid={`activity-status-${item.id}`}
                          className={item.status === 'COMPLETED' ? 'badge-green' : item.status === 'PENDING' ? 'badge-yellow' : 'badge-red'}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{formatDate(item.date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  )
}

export const getServerSideProps: GetServerSideProps = async () => {
  const [users, products, orders, payments] = await Promise.all([
    prisma.user.count(),
    prisma.product.count(),
    prisma.order.count(),
    prisma.payment.findMany({ include: { order: { include: { user: true, product: true } } }, orderBy: { createdAt: 'desc' }, take: 10 }),
  ])

  const revenue = payments.reduce((sum, p) => sum + p.amountCents, 0)

  return {
    props: {
      stats: { users, products, orders, revenue },
      recentActivity: payments.map((p) => ({
        id: p.id,
        userName: p.order.user.name || p.order.user.email,
        productName: p.order.product.name,
        amount: p.amountCents,
        status: p.status,
        date: p.createdAt.toISOString(),
      })),
    },
  }
}
