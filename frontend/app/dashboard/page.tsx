import { AdminLayout } from '@/components/AdminLayout'
import { Card } from '@/components/Card'
import { Users, Package, FileText, TrendingUp } from 'lucide-react'

interface StatCard {
  label: string
  value: string
  icon: React.ComponentType<{ size: number }>
  trend?: string
}

function StatCard({ label, value, icon: Icon, trend }: StatCard) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-text-secondary font-medium">{label}</p>
          <p className="text-3xl font-bold text-foreground mt-3">{value}</p>
          {trend && (
            <div className="flex items-center gap-1 mt-2 text-sm text-success">
              <TrendingUp size={16} />
              <span>{trend}</span>
            </div>
          )}
        </div>
        <div className="p-3 rounded-md bg-surface text-text-secondary">
          <Icon size={24} />
        </div>
      </div>
    </Card>
  )
}

export default function AdminDashboard() {
  const stats: StatCard[] = [
    {
      label: 'Foydalanuvchilar',
      value: '1,234',
      icon: Users,
      trend: '+12% o\'rtacha',
    },
    {
      label: 'Mahsulotlar',
      value: '56',
      icon: Package,
      trend: '+5% o\'rtacha',
    },
    {
      label: 'Kutilayotgan Arizalar',
      value: '12',
      icon: FileText,
      trend: '-3% o\'rtacha',
    },
  ]

  return (
    <AdminLayout
      title="Dashboard"
      description="Admin panelga xush kelibsiz"
    >
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>

        {/* Recent Activity */}
        <Card title="So'nggi Faoliyat" subtitle="Oxirgi harakatlar">
          <div className="text-center py-8 text-text-secondary">
            Hozircha ma'lumot mavjud emas
          </div>
        </Card>
      </div>
    </AdminLayout>
  )
}
