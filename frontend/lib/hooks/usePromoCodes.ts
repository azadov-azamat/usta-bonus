import { useQuery } from '@tanstack/react-query'
import { promoCodesAPI } from '../api'

export interface PromoCode {
  id: string
  code: string
  status?: string
  activatedAt?: string
  activatedBy?: any
}

export function usePromoCodes() {
  return useQuery({
    queryKey: ['promo-codes'],
    queryFn: async () => {
      const response = await promoCodesAPI.getAll()
      const data = response.data
      const items = data.items || data.data || []
      return items.map((code: any) => ({
        id: code.id,
        code: code.code,
        status: code.status,
        activatedAt: code.activatedAt,
        activatedBy: code.activatedBy,
      }))
    },
  })
}

export function usePromoCodesByProduct(productId: string) {
  return useQuery({
    queryKey: ['promo-codes', productId],
    queryFn: async () => {
      const response = await promoCodesAPI.getByProduct(productId)
      const codes = response.data || []
      return codes.map((code: any) => ({
        id: code.id,
        code: code.code,
        status: code.status,
        discount: code.discount,
        activatedAt: code.activatedAt,
        activatedBy: code.activatedBy,
      }))
    },
    enabled: !!productId,
  })
}
