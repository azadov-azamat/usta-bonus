import { AdminLayout } from '@/components/AdminLayout'
import { Card } from '@/components/Card'
import { Users, Package, FileText } from 'lucide-react'

export default function AdminDashboard() {
  const stats = [
    {
      label: 'Foydalanuvchilar',
      value: '1,234',
      icon: Users,
      color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    },
    {
      label: 'Mahsulotlar',
      value: '56',
      icon: Package,
      color: 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    },
    {
      label: 'Kutilayotgan Arizalar',
      value: '12',
      icon: FileText,
      color: 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
    },
  ]

  return (
    <AdminLayout
      title="Dashboard"
      description="Admin panelga xush kelibsiz"
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, idx) => {
            const Icon = stat.icon
            return (
              <Card key={idx} className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted text-sm font-medium">{stat.label}</p>
                    <p className="text-3xl font-bold text-foreground mt-2">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <Icon size={24} />
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        {/* Recent Activity */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-foreground mb-4">So'nggi Faoliyat</h2>
          <div className="text-center py-8 text-muted">
            Hozircha ma'lumot mavjud emas
          </div>
        </Card>
      </div>
    </AdminLayout>
  )
}
