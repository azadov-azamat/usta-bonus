'use client'

import React from 'react'
import { useUsers } from '@/lib/hooks/useUsers'
import { AdminLayout } from '@/components/AdminLayout'
import { DataTable } from '@/components/DataTable'
import { Card } from '@/components/Card'
import { ProtectedRoute } from "@/components/ProtectedRoute"

function UsersContent() {
  const { data: users = [], isLoading, error } = useUsers()

  const columns = [
    {
      key: 'fullName' as const,
      label: 'Ism',
      sortable: true,
    },
    {
      key: 'username' as const,
      label: 'Foydalanuvchi nomi',
      sortable: true,
    },
    {
      key: 'phoneNumber' as const,
      label: 'Telefon',
      sortable: false,
    },
    {
      key: 'balance' as const,
      label: 'Balans (so\'m)',
      render: (value: number) => `${value.toLocaleString()}`,
    },
    {
      key: 'totalEarned' as const,
      label: 'Jami Oldi (so\'m)',
      render: (value: number) => `${(value || 0).toLocaleString()}`,
    },
  ]

  if (error) {
    return (
      <AdminLayout title="Foydalanuvchilar" description="Foydalanuvchilar ro'yhatini boshqaring">
        <Card>
          <div className="bg-error/10 border border-error/30 p-4 rounded-md text-error text-sm">
            Xatolik yuz berdi. Iltimos qayta urinib ko\'ring.
          </div>
        </Card>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout 
      title="Foydalanuvchilar"
      description="Foydalanuvchilar ro'yhatini boshqaring"
    >
      <div className="space-y-6">
        {/* Summary */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-text-secondary font-medium">Jami foydalanuvchilar: <span className="text-foreground font-semibold">{users.length}</span></p>
        </div>

        {/* Users Table */}
        <Card>
          <DataTable
            data={users}
            columns={columns}
            loading={isLoading}
            emptyMessage="Foydalanuvchilar topilmadi"
            actions={[
              {
                label: 'Ko\'rish',
                onClick: (row) => console.log('View user:', row),
              },
              {
                label: 'Tahrirlash',
                onClick: (row) => console.log('Edit user:', row),
              },
            ]}
          />
        </Card>
      </div>
    </AdminLayout>
  )
}

export default function UsersPage() {
  return (
    <ProtectedRoute>
      <UsersContent />
    </ProtectedRoute>
  )
}
