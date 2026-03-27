import { useQuery, useMutation, useQueryClient, UseQueryResult } from '@tanstack/react-query'
import { productsAPI } from '../api'

export interface Product {
  id: string
  name: string
  quantity: number
  bonusAmount: number
  createdAt: string
  generatedCodesCount?: number
  activatedCodesCount?: number
  availableCodesCount?: number
}

export function useProducts(): UseQueryResult<Product[]> {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await productsAPI.getAll()
      const data = response.data
      const items = data.items || data.data || []
      return items.map((product: any) => ({
        id: product.id,
        name: product.name,
        quantity: product.quantity || 0,
        bonusAmount: product.bonusAmount || 0,
        createdAt: product.createdAt,
        generatedCodesCount: product.generatedCodesCount || 0,
        activatedCodesCount: product.activatedCodesCount || 0,
        availableCodesCount: product.availableCodesCount || 0,
      }))
    },
  })
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const response = await productsAPI.getById(id)
      const product = response.data.item || response.data
      return {
        id: product.id,
        name: product.name,
        quantity: product.quantity || 0,
        bonusAmount: product.bonusAmount || 0,
        createdAt: product.createdAt,
        generatedCodesCount: product.generatedCodesCount || 0,
        activatedCodesCount: product.activatedCodesCount || 0,
        availableCodesCount: product.availableCodesCount || 0,
      }
    },
    enabled: !!id,
  })
}

export function useImportProducts() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (file: FormData) => {
      const response = await productsAPI.importExcel(file)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}
