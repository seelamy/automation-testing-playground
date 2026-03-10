interface StatsCardProps {
  title: string
  value: string | number
  icon: string
  change?: string
  testId: string
}

export default function StatsCard({ title, value, icon, change, testId }: StatsCardProps) {
  return (
    <div data-testid={testId} className="card p-6">
      <div className="flex items-center justify-between">
        <div>
          <p data-testid={`${testId}-title`} className="text-sm text-gray-500 font-medium">{title}</p>
          <p data-testid={`${testId}-value`} className="text-3xl font-bold mt-1">{value}</p>
          {change && (
            <p data-testid={`${testId}-change`} className="text-xs text-green-600 mt-1">
              {change}
            </p>
          )}
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </div>
  )
}
