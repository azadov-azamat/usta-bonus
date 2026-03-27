'use client'

import React from 'react'
import {
  useWithdrawalRequests,
  useUploadWithdrawalImage,
  WithdrawalRequest,
} from '@/lib/hooks/useWithdrawal'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { AdminLayout } from '@/components/AdminLayout'
import { DataTable } from '@/components/DataTable'
import { Badge } from '@/components/Badge'
import { Card } from '@/components/Card'
import { UploadZone } from '@/components/UploadZone'

function WithdrawalRequestsContent() {
  const { data: requests = [], isLoading, error } = useWithdrawalRequests()
  const [selectedRequestId, setSelectedRequestId] = React.useState<string | null>(null)

  const selectedRequest = React.useMemo(
    () =>
      selectedRequestId
        ? requests.find((request: WithdrawalRequest) => request.id === selectedRequestId) ?? null
        : null,
    [requests, selectedRequestId]
  )

  const statusVariant = (status: string): 'default' | 'success' | 'warning' | 'danger' => {
    const variants: Record<string, 'default' | 'success' | 'warning' | 'danger'> = {
      pending: 'warning',
      completed: 'success',
      rejected: 'danger',
    }
    return variants[status] || 'default'
  }

  const statusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Kutilayotgan',
      completed: 'Tasdiqlangan',
      rejected: 'Rad etilgan',
    }
    return labels[status] || status
  }

  const columns = [
    {
      key: 'id' as const,
      label: 'Arizaning ID',
      sortable: true,
      width: '120px',
    },
    {
      key: 'amount' as const,
      label: 'Summa',
      render: (value: number) => `${value.toLocaleString()} so\'m`,
    },
    {
      key: 'status' as const,
      label: 'Holati',
      render: (value: string) => (
        <Badge variant={statusVariant(value)}>
          {statusLabel(value)}
        </Badge>
      ),
    },
    {
      key: 'requestedAt' as const,
      label: 'Yaratilgan',
      render: (value: string) => new Date(value).toLocaleDateString('uz-UZ'),
    },
  ]

  const openRequestDetails = React.useCallback((request: WithdrawalRequest) => {
    setSelectedRequestId(request.id)
  }, [])

  if (error) {
    return (
      <AdminLayout
        title="Chiqarish Arziları"
        description="Foydalanuvchilarning chiqarish arizalarini boshqaring"
      >
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-lg text-red-800 dark:text-red-400">
          Xatolik yuz berdi. Iltimos qayta urinib ko\'ring.
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout
      title="Chiqarish Arziları"
      description="Foydalanuvchilarning chiqarish arizalarini boshqaring"
    >
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <p className="text-muted text-sm font-medium">Jami Arizalar</p>
            <p className="text-2xl font-bold text-foreground mt-2">
              {requests.length}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-muted text-sm font-medium">Kutilayotgan</p>
            <p className="text-2xl font-bold text-foreground mt-2">
              {requests.filter((r: any) => r.status === "pending").length}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-muted text-sm font-medium">Tasdiqlangan</p>
            <p className="text-2xl font-bold text-foreground mt-2">
              {requests.filter((r: any) => r.status === "completed").length}
            </p>
          </Card>
        </div>

        {/* Requests Table */}
        <DataTable
          data={requests}
          columns={columns}
          loading={isLoading}
          emptyMessage="Arizalar topilmadi"
          onRowClick={openRequestDetails}
          actions={[
            {
              label: "Tafsilotlar",
              onClick: openRequestDetails,
              className: "border border-border bg-background text-foreground hover:bg-secondary",
            },
          ]}
        />

        {/* Selected Request Details */}
        {selectedRequest && (
          <WithdrawalRequestDetails
            request={selectedRequest}
            onClose={() => setSelectedRequestId(null)}
          />
        )}
      </div>
    </AdminLayout>
  );
}

export default function WithdrawalRequestsPage() {
  return (
    <ProtectedRoute>
      <WithdrawalRequestsContent />
    </ProtectedRoute>
  )
}

interface WithdrawalRequestDetailsProps {
  request: WithdrawalRequest
  onClose: () => void
}

function WithdrawalRequestDetails({
  request,
  onClose,
}: WithdrawalRequestDetailsProps) {
  const uploadMutation = useUploadWithdrawalImage()
  const [showUpload, setShowUpload] = React.useState(false)

  const handleImageUpload = async (file: File) => {
    const formData = new FormData()
    formData.append('receipt', file)

    uploadMutation.mutate(
      { id: request.id, file: formData },
      {
        onSuccess: () => {
          alert('Rasm muvaffaqiyatli yuklandi')
          setShowUpload(false)
        },
        onError: () => {
          alert('Rasm yuklashda xatolik yuz berdi')
        },
      }
    )
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-foreground">Ariza Tafsilotlari</h2>
        <button
          onClick={onClose}
          className="text-muted hover:text-foreground transition-colors text-2xl"
        >
          ×
        </button>
      </div>

      <div className="space-y-6">
        {/* Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-muted">Ariza ID</label>
            <p className="text-lg font-mono font-bold text-foreground mt-2">
              {request.id}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted">Foydalanuvchi ID</label>
            <p className="text-lg font-mono font-bold text-foreground mt-2">
              {request.user?.id || 'N/A'}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted">Summa</label>
            <p className="text-lg font-bold text-foreground mt-2">
              {request.amount.toLocaleString()} so\'m
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted">Holati</label>
            <Badge variant={request.status === 'pending' ? 'warning' : request.status === 'completed' ? 'success' : 'danger'}>
              {request.status === 'pending' ? 'Kutilayotgan' : request.status === 'completed' ? 'Tasdiqlangan' : 'Rad etilgan'}
            </Badge>
          </div>
        </div>

        {/* Image Section */}
        <div className="border-t border-border pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-foreground">Rasm</h3>
            {request.status === 'pending' && !request.receiptImageUrl && !showUpload && (
              <button
                onClick={() => setShowUpload(true)}
                className="text-sm text-foreground transition-colors hover:text-muted"
              >
                Rasm Yuklash
              </button>
            )}
          </div>

          {request.receiptImageUrl ? (
            <div className="space-y-3">
              <img
                src={request.receiptImageUrl}
                alt="Ariza Rasmi"
                className="max-w-sm max-h-96 rounded-lg border border-border"
              />
              {uploadMutation.isPending && <p className="text-sm text-muted">Yuklanmoqda...</p>}
            </div>
          ) : showUpload ? (
            <UploadZone
              onFileSelect={handleImageUpload}
              accept="image/*"
              label="Rasm faylini tanlang yoki sudring"
              description="PNG, JPG, JPEG (max 5MB)"
              loading={uploadMutation.isPending}
            />
          ) : (
            <div className="text-center py-8 text-muted">
              Rasm mavjud emas
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
