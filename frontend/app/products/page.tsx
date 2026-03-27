'use client'

import React from 'react'
import Link from 'next/link'
import { Download, Plus } from 'lucide-react'
import { useProducts, useImportProducts } from '@/lib/hooks/useProducts'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { AdminLayout } from '@/components/AdminLayout'
import { DataTable } from '@/components/DataTable'
import { Card } from '@/components/Card'
import { Button } from '@/components/Button'
import { UploadZone } from '@/components/UploadZone'
import { importFromExcel, exportToExcel, createExcelTemplate } from '@/lib/utils/excel'

function ProductsContent() {
  const { data: products = [], isLoading, error } = useProducts()
  const importMutation = useImportProducts()
  const [showImport, setShowImport] = React.useState(false)

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
      const excelData = await importFromExcel(file)
      const formData = new FormData()
      formData.append('file', file)

      importMutation.mutate(formData, {
        onSuccess: () => {
          setShowImport(false)
          alert('Mahsulotlar muvaffaqiyatli import qilindi')
        },
        onError: () => {
          alert('Importda xatolik yuz berdi')
        },
      })
    } catch (error) {
      alert('Excelni tahlil qilishda xatolik yuz berdi')
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
        {/* Actions */}
        <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
          <div>
            <p className="text-sm text-muted">Jami mahsulotlar: {products.length}</p>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button variant="secondary" size="md" onClick={handleExportTemplate}>
              <Download size={18} />
              Shabloni yuklash
            </Button>

            <Button
              variant="secondary"
              size="md"
              onClick={handleExportData}
              disabled={products.length === 0}
            >
              <Download size={18} />
              Ma\'lumotlarni yuklash
            </Button>

            <Button
              variant="primary"
              size="md"
              onClick={() => setShowImport(!showImport)}
            >
              <Plus size={18} />
              {showImport ? 'Bekor qilish' : 'Import qilish'}
            </Button>
          </div>
        </div>

        {/* Import Section */}
        {showImport && (
          <Card className="p-6">
            <h3 className="text-lg font-bold text-foreground mb-4">Excel faylni import qilish</h3>
            <UploadZone
              onFileSelect={handleImport}
              loading={importMutation.isPending}
            />
            {importMutation.isPending && (
              <p className="text-sm text-muted mt-4">Import qilinmoqda...</p>
            )}
          </Card>
        )}

        {/* Products Table */}
        <DataTable
          data={products}
          columns={columns}
          loading={isLoading}
          emptyMessage="Mahsulotlar topilmadi"
          onRowClick={(row) => {
            // Navigate to product details page
            window.location.href = `/admin/products/${row.id}`
          }}
          actions={[
            {
              label: 'Tafsilotlar',
              onClick: (row) => {
                window.location.href = `/admin/products/${row.id}`
              },
              className: 'bg-primary/10 text-primary hover:bg-primary/20',
            },
          ]}
        />
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
