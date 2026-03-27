'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Copy } from 'lucide-react'
import { useProduct } from '@/lib/hooks/useProducts'
import { usePromoCodesByProduct } from '@/lib/hooks/usePromoCodes'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { AdminLayout } from '@/components/AdminLayout'
import { Card } from '@/components/Card'
import { DataTable } from '@/components/DataTable'
import { Badge } from '@/components/Badge'
import { Button } from '@/components/Button'

function ProductDetailsContent({
  params,
}: {
  params: { id: string }
}) {
  const router = useRouter()
  const { data: product, isLoading: productLoading, error: productError } = useProduct(params.id)
  const {
    data: promoCodes = [],
    isLoading: promoLoading,
    error: promoError,
  } = usePromoCodesByProduct(params.id)

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    alert('Kod ko\'chirib olindi')
  }

  if (productError || promoError) {
    return (
      <AdminLayout
        title="Mahsulot Tafsilotlari"
        description="Mahsulot haqida ma'lumot va promokodlar"
      >
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-lg text-red-800 dark:text-red-400">
          Xatolik yuz berdi. Iltimos qayta urinib ko\'ring.
        </div>
      </AdminLayout>
    )
  }

  if (productLoading) {
    return (
      <AdminLayout
        title="Mahsulot Tafsilotlari"
        description="Mahsulot haqida ma'lumot va promokodlar"
      >
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary"></div>
        </div>
      </AdminLayout>
    )
  }

  const columns = [
    {
      key: 'code' as const,
      label: 'Promokod',
      sortable: true,
    },
    {
      key: 'discount' as const,
      label: 'Chegirma',
      render: (value: number) => `${value}%`,
    },
    {
      key: 'createdAt' as const,
      label: 'Yaratilgan',
      render: (value: string) => new Date(value).toLocaleDateString('uz-UZ'),
    },
  ]

  return (
    <AdminLayout
      title="Mahsulot Tafsilotlari"
      description="Mahsulot haqida ma'lumot va promokodlar"
    >
      <div className="space-y-6">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-primary hover:text-blue-600 transition-colors mb-4"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Orqaga</span>
        </button>

        {/* Product Info */}
        {product && (
          <Card className="p-6">
            <div className="space-y-6">
              <div className="border-b border-border pb-6">
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  {product.name}
                </h1>
                <p className="text-muted text-sm">
                  Yaratilgan:{' '}
                  {new Date(product.createdAt).toLocaleDateString('uz-UZ', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-muted">Soni</label>
                  <p className="text-2xl font-bold text-foreground mt-2">
                    {product.quantity.toLocaleString()}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted">Bonus Summasi</label>
                  <p className="text-2xl font-bold text-foreground mt-2">
                    {product.bonusAmount.toLocaleString()} so\'m
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Promo Codes */}
        <Card className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-foreground">Promokodlar</h2>
            <p className="text-sm text-muted mt-1">
              Bu mahsulotga tegishli {promoCodes.length} ta promokod mavjud
            </p>
          </div>

          {promoCodes.length === 0 ? (
            <div className="text-center py-8 text-muted">
              Ushbu mahsulot uchun promokodlar mavjud emas
            </div>
          ) : (
            <div className="space-y-2">
              {promoCodes.map((promo) => (
                <div
                  key={promo.id}
                  className="flex items-center justify-between p-4 bg-muted/5 rounded-lg border border-border hover:border-primary/50 transition-colors"
                >
                  <div className="space-y-1">
                    <p className="font-mono font-bold text-foreground">
                      {promo.code}
                    </p>
                    <p className="text-sm text-muted">
                      Chegirma: {promo.discount}%
                    </p>
                  </div>

                  <button
                    onClick={() => handleCopyCode(promo.code)}
                    className="p-2 hover:bg-primary/10 rounded transition-colors text-primary"
                    title="Kopyalash"
                  >
                    <Copy size={20} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </AdminLayout>
  )
}

export default function ProductDetailsPage({
  params,
}: {
  params: { id: string }
}) {
  return (
    <ProtectedRoute>
      <ProductDetailsContent params={params} />
    </ProtectedRoute>
  )
}
