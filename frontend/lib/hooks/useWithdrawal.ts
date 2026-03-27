import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { withdrawalAPI } from '../api'

export interface WithdrawalRequest {
  id: string
  amount: number
  status: string
  receiptImageUrl?: string
  receiptImagePath?: string
  requestedAt: string
  completedAt?: string
  user?: {
    id: string
    fullName: string
    phoneNumber?: string
    chatId?: string
  }
}

export function useWithdrawalRequests() {
  return useQuery({
    queryKey: ['withdrawal-requests'],
    queryFn: async () => {
      const response = await withdrawalAPI.getAll()
      const items = response.data || []
      return items.map((request: any) => ({
        id: request.id,
        amount: request.amount || 0,
        status: request.status,
        receiptImageUrl: request.receiptImageUrl,
        receiptImagePath: request.receiptImagePath,
        requestedAt: request.requestedAt,
        completedAt: request.completedAt,
        user: request.user,
      }))
    },
  })
}

export function useWithdrawalRequest(id: string) {
  return useQuery({
    queryKey: ['withdrawal-request', id],
    queryFn: async () => {
      const response = await withdrawalAPI.getById(id)
      const request = response.data.item || response.data
      return {
        id: request.id,
        amount: request.amount || 0,
        status: request.status,
        receiptImageUrl: request.receiptImageUrl,
        receiptImagePath: request.receiptImagePath,
        requestedAt: request.requestedAt,
        completedAt: request.completedAt,
        user: request.user,
      }
    },
    enabled: !!id,
  })
}

export function useUploadWithdrawalImage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, file }: { id: string; file: FormData }) => {
      const response = await withdrawalAPI.uploadImage(id, file)
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['withdrawal-request', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['withdrawal-requests'] })
    },
  })
}
