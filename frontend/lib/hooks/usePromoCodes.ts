import { useQuery } from '@tanstack/react-query'
import { promoCodesAPI } from '../api'

export interface PromoCode {
  id: string
  code: string
  status: string
  activatedAt?: string
  activatedBy?: {
    id: string
    telegramId?: string
    fullName?: string
    phoneNumber?: string
  } | null
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
        status: code.status || 'new',
        activatedAt: code.activatedAt,
        activatedBy: code.activatedBy || null,
      }))
    },
    enabled: !!productId,
  })
}
