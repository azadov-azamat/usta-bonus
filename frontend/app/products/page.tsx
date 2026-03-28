'use client'

import React from 'react'
import { Download, Plus } from 'lucide-react'
import { useProducts, useImportProducts } from '@/lib/hooks/useProducts'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { AdminLayout } from '@/components/AdminLayout'
import { DataTable } from '@/components/DataTable'
import { Card } from '@/components/Card'
import { Button } from '@/components/Button'
import { UploadZone } from '@/components/UploadZone'
import { importFromExcel, exportToExcel, createExcelTemplate } from '@/lib/utils/excel'
import { useToast } from '@/lib/hooks/useToast'

function ProductsContent() {
  const { data: products = [], isLoading, error } = useProducts()
  const importMutation = useImportProducts()
  const [showImport, setShowImport] = React.useState(false)
  const { toast } = useToast()

  const handleExportTemplate = () => {
    createExcelTemplate()
  }

  const handleExportData = () => {
    exportToExcel(
      products.map((p) => ({
        name: p.name,
        quantity: p.quantity,
        bonusAmount: p.bonusAmount,
      })),
      'products'
    )
  }

  const handleImport = async (file: File) => {
    try {
      await importFromExcel(file)
      const formData = new FormData()
      formData.append('file', file)

      importMutation.mutate(formData, {
        onSuccess: () => {
          setShowImport(false)
          toast({
            title: 'Import yakunlandi',
            description: 'Mahsulotlar muvaffaqiyatli import qilindi.',
            variant: 'success',
          })
        },
      })
    } catch (error) {
      toast({
        title: 'Excel o‘qilmadi',
        description: 'Excel faylini tahlil qilishda xatolik yuz berdi.',
        variant: 'error',
      })
    }
  }

  const columns = [
    {
      key: 'name' as const,
      label: 'Mahsulot nomi',
      sortable: true,
    },
    {
      key: 'quantity' as const,
      label: 'Soni',
      sortable: true,
      render: (value: number) => value.toLocaleString(),
    },
    {
      key: 'bonusAmount' as const,
      label: 'Bonus Summasi',
      render: (value: number) => `${value.toLocaleString()} so\'m`,
    },
    {
      key: 'createdAt' as const,
      label: 'Yaratilgan',
      render: (value: string) => new Date(value).toLocaleDateString('uz-UZ'),
    },
  ]

  if (error) {
    return (
      <AdminLayout
        title="Mahsulotlar"
        description="Mahsulotlarni boshqaring va import/export qiling"
      >
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-lg text-red-800 dark:text-red-400">
          Xatolik yuz berdi. Iltimos qayta urinib ko\'ring.
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout
      title="Mahsulotlar"
      description="Mahsulotlarni boshqaring va import/export qiling"
    >
      <div className="space-y-6">
        {/* Actions Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div>
            <p className="text-sm text-text-secondary font-medium">Jami mahsulotlar: <span className="text-foreground font-semibold">{products.length}</span></p>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button variant="secondary" size="md" onClick={handleExportTemplate} icon={<Download size={16} />}>
              Shabloni yuklash
            </Button>

            <Button
              variant="secondary"
              size="md"
              onClick={handleExportData}
              disabled={products.length === 0}
              icon={<Download size={16} />}
            >
              Ma&apos;lumotlarni yuklash
            </Button>

            <Button
              variant="primary"
              size="md"
              onClick={() => setShowImport(!showImport)}
              icon={<Plus size={16} />}
            >
              {showImport ? 'Bekor qilish' : 'Import qilish'}
            </Button>
          </div>
        </div>

        {/* Import Section */}
        {showImport && (
          <Card title="Excel faylni import qilish" subtitle="Shakilni yuklang va faylni tanlang">
            <UploadZone
              onFileSelect={handleImport}
              loading={importMutation.isPending}
            />
            {importMutation.isPending && (
              <p className="text-sm text-text-secondary mt-4">Import qilinmoqda...</p>
            )}
          </Card>
        )}

        {/* Products Table */}
        <Card>
          <DataTable
            data={products}
            columns={columns}
            loading={isLoading}
            emptyMessage="Mahsulotlar topilmadi"
            onRowClick={(row) => {
              window.location.href = `/products/${row.id}`
            }}
            actions={[
              {
                label: 'Ko\'rish',
                onClick: (row) => {
                  window.location.href = `/products/${row.id}`
                },
              },
            ]}
          />
        </Card>
      </div>
    </AdminLayout>
  )
}

export default function ProductsPage() {
  return (
    <ProtectedRoute>
      <ProductsContent />
    </ProtectedRoute>
  )
}
