'use client'

import React from 'react'
import { useTranslation } from 'react-i18next'
import { AdminLayout } from '@/components/AdminLayout'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Card } from '@/components/Card'
import { useUsers } from '@/lib/hooks/useUsers'
import { useProducts } from '@/lib/hooks/useProducts'
import { useWithdrawalRequests } from '@/lib/hooks/useWithdrawal'
import { Users, Package, DollarSign, TrendingUp } from 'lucide-react'

function DashboardContent() {
  const { t } = useTranslation()
  const { data: users = [], isLoading: usersLoading } = useUsers()
  const { data: products = [], isLoading: productsLoading } = useProducts()
  const { data: withdrawals = [], isLoading: withdrawalsLoading } = useWithdrawalRequests()

  const totalUsers = users.length
  const totalProducts = products.length
  const pendingWithdrawals = withdrawals.filter(
    (w: any) => w.status === "pending",
  ).length;
  const totalBalance = users.reduce((sum, user) => sum + (user.balance || 0), 0)

  const stats = [
    {
      title: t('dashboard.users'),
      value: totalUsers,
      icon: Users,
      color: 'border border-border bg-secondary text-foreground',
      loading: usersLoading,
    },
    {
      title: t('dashboard.products'),
      value: totalProducts,
      icon: Package,
      color: 'border border-border bg-secondary text-foreground',
      loading: productsLoading,
    },
    {
      title: t('withdrawals.pending'),
      value: pendingWithdrawals,
      icon: DollarSign,
      color: 'border border-border bg-secondary text-foreground',
      loading: withdrawalsLoading,
    },
    {
      title: t('users.balance'),
      value: `${(totalBalance / 1000000).toFixed(1)}M`,
      icon: TrendingUp,
      color: 'border border-border bg-secondary text-foreground',
      loading: usersLoading,
    },
  ]

  return (
    <AdminLayout title="">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold text-foreground">
            {t('dashboard.welcome')}
          </h1>
          <p className="text-muted">
            {t('dashboard.overview')} • {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index} className="overflow-hidden">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-muted font-medium mb-2">
                      {stat.title}
                    </p>
                    {stat.loading ? (
                      <div className="h-8 w-16 bg-border rounded animate-pulse" />
                    ) : (
                      <p className="text-3xl font-bold text-foreground">
                        {stat.value}
                      </p>
                    )}
                  </div>
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="flex flex-col gap-4">
              <h3 className="text-xl font-bold text-foreground">
                {t('dashboard.users')}
              </h3>
              <p className="text-sm text-muted">
                {totalUsers} {totalUsers === 1 ? 'user' : 'users'} registered
              </p>
              <a
                href="/users"
                className="inline-block text-sm font-semibold text-foreground transition-colors hover:text-muted"
              >
                View all →
              </a>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex flex-col gap-4">
              <h3 className="text-xl font-bold text-foreground">
                {t('dashboard.products')}
              </h3>
              <p className="text-sm text-muted">
                {totalProducts} products available
              </p>
              <a
                href="/products"
                className="inline-block text-sm font-semibold text-foreground transition-colors hover:text-muted"
              >
                Manage products →
              </a>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex flex-col gap-4">
              <h3 className="text-xl font-bold text-foreground">
                {t('withdrawals.title')}
              </h3>
              <p className="text-sm text-muted">
                {pendingWithdrawals} pending requests
              </p>
              <a
                href="/withdrawal-requests"
                className="inline-block text-sm font-semibold text-foreground transition-colors hover:text-muted"
              >
                Review requests →
              </a>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex flex-col gap-4">
              <h3 className="text-xl font-bold text-foreground">System Status</h3>
              <p className="text-sm text-muted">All systems operational</p>
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                <div className="h-2 w-2 rounded-full bg-foreground" />
                Online
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}

export default function HomePage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}
