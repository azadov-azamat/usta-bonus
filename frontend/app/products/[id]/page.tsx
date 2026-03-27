'use client'

import React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Copy } from 'lucide-react'
import { useProduct } from '@/lib/hooks/useProducts'
import { usePromoCodesByProduct } from '@/lib/hooks/usePromoCodes'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { AdminLayout } from '@/components/AdminLayout'
import { Card } from '@/components/Card'
import { useToast } from '@/lib/hooks/useToast'

function ProductDetailsContent() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const productId = typeof params?.id === 'string' ? params.id : ''
  const { toast } = useToast()
  const { data: product, isLoading: productLoading, error: productError } = useProduct(productId)
  const {
    data: promoCodes = [],
    error: promoError,
  } = usePromoCodesByProduct(productId)

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      toast({
        title: 'Kod ko‘chirildi',
        description: 'Promokod clipboardga nusxalandi.',
        variant: 'success',
      })
    } catch (error) {
      toast({
        title: 'Nusxalab bo‘lmadi',
        description: 'Promokodni ko‘chirishda xatolik yuz berdi.',
        variant: 'error',
      })
    }
  }

  const getPromoStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      new: 'Yangi',
      activated: 'Faollashtirilgan',
    }

    return labels[status] || status
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

  return (
    <AdminLayout
      title="Mahsulot Tafsilotlari"
      description="Mahsulot haqida ma'lumot va promokodlar"
    >
      <div className="space-y-6">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-2 text-foreground transition-colors hover:text-muted"
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
              {promoCodes.map((promo: any) => (
                <div
                  key={promo.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-background p-4 transition-colors hover:bg-secondary/40"
                >
                  <div className="space-y-1">
                    <p className="font-mono font-bold text-foreground">
                      {promo.code}
                    </p>
                    <p className="text-sm text-muted">
                      Holati: {getPromoStatusLabel(promo.status)}
                    </p>
                    {promo.activatedAt && (
                      <p className="text-sm text-muted">
                        Faollashgan: {new Date(promo.activatedAt).toLocaleDateString('uz-UZ')}
                      </p>
                    )}
                    {promo.activatedBy?.fullName && (
                      <p className="text-sm text-muted">
                        Foydalanuvchi: {promo.activatedBy.fullName}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => handleCopyCode(promo.code)}
                    className="rounded p-2 text-foreground transition-colors hover:bg-secondary"
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

export default function ProductDetailsPage() {
  return (
    <ProtectedRoute>
      <ProductDetailsContent />
    </ProtectedRoute>
  )
}
