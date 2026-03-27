import { AdminLayout } from '@/components/AdminLayout'
import { Card } from '@/components/Card'
import { Users, Package, FileText } from 'lucide-react'

export default function AdminDashboard() {
  const stats = [
    {
      label: 'Foydalanuvchilar',
      value: '1,234',
      icon: Users,
      color: 'border border-border bg-secondary text-foreground',
    },
    {
      label: 'Mahsulotlar',
      value: '56',
      icon: Package,
      color: 'border border-border bg-secondary text-foreground',
    },
    {
      label: 'Kutilayotgan Arizalar',
      value: '12',
      icon: FileText,
      color: 'border border-border bg-secondary text-foreground',
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
