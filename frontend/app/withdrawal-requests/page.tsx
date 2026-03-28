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
import { Button } from '@/components/Button'
import { ImagePreview } from '@/components/ImagePreview'
import { UploadZone } from '@/components/UploadZone'
import { useToast } from '@/lib/hooks/useToast'

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
      title="Chiqarish Arziları"
      description="Foydalanuvchilarning chiqarish arizalarini boshqaring"
    >
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <p className="text-sm text-text-secondary font-medium">Jami Arizalar</p>
            <p className="text-3xl font-bold text-foreground mt-3">
              {requests.length}
            </p>
          </Card>
          <Card>
            <p className="text-sm text-text-secondary font-medium">Kutilayotgan</p>
            <p className="text-3xl font-bold text-foreground mt-3">
              {requests.filter((r: any) => r.status === "pending").length}
            </p>
          </Card>
          <Card>
            <p className="text-sm text-text-secondary font-medium">Tasdiqlangan</p>
            <p className="text-3xl font-bold text-foreground mt-3">
              {requests.filter((r: any) => r.status === "completed").length}
            </p>
          </Card>
        </div>

        {/* Requests Table */}
        <Card>
          <DataTable
            data={requests}
            columns={columns}
            loading={isLoading}
            emptyMessage="Arizalar topilmadi"
            onRowClick={openRequestDetails}
            actions={[
              {
                label: "Ko\'rish",
                onClick: openRequestDetails,
              },
            ]}
          />
        </Card>

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
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null)
  const { toast } = useToast()

  React.useEffect(() => {
    setShowUpload(false)
    setSelectedFile(null)
  }, [request.id])

  React.useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null)
      return
    }

    const objectUrl = URL.createObjectURL(selectedFile)
    setPreviewUrl(objectUrl)

    return () => {
      URL.revokeObjectURL(objectUrl)
    }
  }, [selectedFile])

  const closeUploadPanel = React.useCallback(() => {
    setSelectedFile(null)
    setShowUpload(false)
  }, [])

  const submitSelectedImage = React.useCallback(() => {
    if (!selectedFile) {
      toast({
        title: 'Rasm tanlanmagan',
        description: 'Avval yuboriladigan rasmni tanlang.',
        variant: 'error',
      })
      return
    }

    const formData = new FormData()
    formData.append('receipt', selectedFile)

    uploadMutation.mutate(
      { id: request.id, file: formData },
      {
        onSuccess: () => {
          toast({
            title: 'Rasm yuborildi',
            description: 'To'lov cheki muvaffaqiyatli saqlandi.',
            variant: 'success',
          })
          closeUploadPanel()
        },
        onError: () => {
          toast({
            title: 'Rasm yuborilmadi',
            description: 'Rasm yuklashda xatolik yuz berdi.',
            variant: 'error',
          })
        },
      }
    )
  }, [closeUploadPanel, request.id, selectedFile, toast, uploadMutation])

  return (
    <Card title="Ariza Tafsilotlari" action={<button onClick={onClose} className="text-lg text-foreground hover:text-text-secondary">×</button>}>
      <div className="space-y-6">
        {/* Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-text-secondary">Ariza ID</label>
            <p className="text-base font-mono font-semibold text-foreground mt-2">
              {request.id}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-text-secondary">Foydalanuvchi ID</label>
            <p className="text-base font-mono font-semibold text-foreground mt-2">
              {request.user?.id || 'N/A'}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-text-secondary">Summa</label>
            <p className="text-base font-semibold text-foreground mt-2">
              {request.amount.toLocaleString()} so&apos;m
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-text-secondary">Holati</label>
            <div className="mt-2">
              <Badge variant={request.status === 'pending' ? 'warning' : request.status === 'completed' ? 'success' : 'error'}>
                {request.status === 'pending' ? 'Kutilayotgan' : request.status === 'completed' ? 'Tasdiqlangan' : 'Rad etilgan'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Image Section */}
        <div className="border-t border-border pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Rasm</h3>
            {request.status === 'pending' && !request.receiptImageUrl && !showUpload && (
              <button
                onClick={() => setShowUpload(true)}
                className="text-sm font-medium text-accent hover:text-accent-hover transition-colors"
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
                className="max-w-sm max-h-96 rounded-md border border-border"
              />
              {uploadMutation.isPending && <p className="text-sm text-text-secondary">Yuklanmoqda...</p>}
            </div>
          ) : showUpload ? (
            <div className="space-y-4">
              <UploadZone
                onFileSelect={setSelectedFile}
                selectedFile={selectedFile}
                onClear={() => setSelectedFile(null)}
                accept="image/*"
                label="Rasm faylini tanlang yoki sudring"
                description="PNG, JPG, JPEG (max 5MB)"
                loading={uploadMutation.isPending}
              />

              {previewUrl ? (
                <div className="space-y-3">
                  <p className="text-sm text-text-secondary">
                    Yuborishdan oldin rasmni tekshirib oling. Xato rasm bo&apos;lsa o&apos;chirib qayta yuklashingiz mumkin.
                  </p>
                  <ImagePreview
                    imageUrl={previewUrl}
                    alt="Tanlangan rasm"
                    onRemove={() => setSelectedFile(null)}
                    className="max-w-sm h-96 border border-border"
                  />
                </div>
              ) : null}

              <div className="flex flex-wrap gap-3">
                <Button
                  variant="primary"
                  onClick={submitSelectedImage}
                  disabled={!selectedFile}
                  loading={uploadMutation.isPending}
                >
                  Yuborish
                </Button>
                <Button
                  variant="secondary"
                  onClick={closeUploadPanel}
                  disabled={uploadMutation.isPending}
                >
                  Bekor qilish
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-text-secondary">
              Rasm mavjud emas
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

    const objectUrl = URL.createObjectURL(selectedFile)
    setPreviewUrl(objectUrl)

    return () => {
      URL.revokeObjectURL(objectUrl)
    }
  }, [selectedFile])

  const closeUploadPanel = React.useCallback(() => {
    setSelectedFile(null)
    setShowUpload(false)
  }, [])

  const submitSelectedImage = React.useCallback(() => {
    if (!selectedFile) {
      toast({
        title: 'Rasm tanlanmagan',
        description: 'Avval yuboriladigan rasmni tanlang.',
        variant: 'error',
      })
      return
    }

    const formData = new FormData()
    formData.append('receipt', selectedFile)

    uploadMutation.mutate(
      { id: request.id, file: formData },
      {
        onSuccess: () => {
          toast({
            title: 'Rasm yuborildi',
            description: 'To‘lov cheki muvaffaqiyatli saqlandi.',
            variant: 'success',
          })
          closeUploadPanel()
        },
        onError: () => {
          toast({
            title: 'Rasm yuborilmadi',
            description: 'Rasm yuklashda xatolik yuz berdi.',
            variant: 'error',
          })
        },
      }
    )
  }, [closeUploadPanel, request.id, selectedFile, toast, uploadMutation])

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
            <div className="space-y-4">
              <UploadZone
                onFileSelect={setSelectedFile}
                selectedFile={selectedFile}
                onClear={() => setSelectedFile(null)}
                accept="image/*"
                label="Rasm faylini tanlang yoki sudring"
                description="PNG, JPG, JPEG (max 5MB)"
                loading={uploadMutation.isPending}
              />

              {previewUrl ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted">
                    Yuborishdan oldin rasmni tekshirib oling. Xato rasm bo‘lsa o‘chirib qayta yuklashingiz mumkin.
                  </p>
                  <ImagePreview
                    imageUrl={previewUrl}
                    alt="Tanlangan rasm"
                    onRemove={() => setSelectedFile(null)}
                    className="max-w-sm h-96 border border-border"
                  />
                </div>
              ) : null}

              <div className="flex flex-wrap gap-3">
                <Button
                  variant="primary"
                  onClick={submitSelectedImage}
                  disabled={!selectedFile}
                  loading={uploadMutation.isPending}
                >
                  Send
                </Button>
                <Button
                  variant="secondary"
                  onClick={closeUploadPanel}
                  disabled={uploadMutation.isPending}
                >
                  Bekor qilish
                </Button>
              </div>
            </div>
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
