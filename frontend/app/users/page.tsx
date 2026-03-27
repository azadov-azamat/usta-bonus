'use client'

import React from 'react'
import { useUsers } from '@/lib/hooks/useUsers'
import { AdminLayout } from '@/components/AdminLayout'
import { DataTable } from '@/components/DataTable'
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
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-lg text-red-800 dark:text-red-400">
          Xatolik yuz berdi. Iltimos qayta urinib ko\'ring.
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="">
      <div className="space-y-6">
      
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted">Jami foydalanuvchilar: {users.length}</p>
          </div>
        </div>

        <DataTable
          data={users}
          columns={columns}
          loading={isLoading}
          emptyMessage="Foydalanuvchilar topilmadi"
          actions={[
            {
              label: 'Ko\'rish',
              onClick: (row) => console.log('View user:', row),
              className: 'border border-border bg-background text-foreground hover:bg-secondary',
            },
            {
              label: 'Tahrirlash',
              onClick: (row) => console.log('Edit user:', row),
              className: 'border border-border bg-background text-foreground hover:bg-secondary',
            },
          ]}
        />
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
