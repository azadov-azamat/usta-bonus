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

const WITHDRAWAL_REQUESTS_QUERY_KEY = ['withdrawal-requests'] as const
const WITHDRAWAL_REQUESTS_REFETCH_INTERVAL = 1000 * 60 * 5

function mapWithdrawalRequest(request: any): WithdrawalRequest {
  return {
    id: String(request.id),
    amount: request.amount || 0,
    status: request.status,
    receiptImageUrl: request.receiptImageUrl,
    receiptImagePath: request.receiptImagePath,
    requestedAt: request.requestedAt,
    completedAt: request.completedAt,
    user: request.user,
  }
}

export function useWithdrawalRequests() {
  return useQuery({
    queryKey: WITHDRAWAL_REQUESTS_QUERY_KEY,
    queryFn: async () => {
      const response = await withdrawalAPI.getAll()
      const items = response.data || []
      return items.map(mapWithdrawalRequest)
    },
    refetchInterval: WITHDRAWAL_REQUESTS_REFETCH_INTERVAL,
    refetchIntervalInBackground: true,
    refetchOnMount: 'always',
    refetchOnReconnect: 'always',
  })
}

export function useWithdrawalRequest(id: string) {
  return useQuery({
    queryKey: ['withdrawal-request', id],
    queryFn: async () => {
      const response = await withdrawalAPI.getById(id)
      const request = response.data.item || response.data
      return mapWithdrawalRequest(request)
    },
    enabled: !!id,
    refetchInterval: WITHDRAWAL_REQUESTS_REFETCH_INTERVAL,
    refetchIntervalInBackground: true,
    refetchOnMount: 'always',
    refetchOnReconnect: 'always',
  })
}

export function useUploadWithdrawalImage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, file }: { id: string; file: FormData }) => {
      const response = await withdrawalAPI.uploadImage(id, file)
      return response.data
    },
    onSuccess: (data, variables) => {
      const updatedRequest = mapWithdrawalRequest(data.item || data)
      const requestQueryKey = ['withdrawal-request', String(variables.id)] as const

      queryClient.setQueryData(requestQueryKey, updatedRequest)
      queryClient.setQueryData<WithdrawalRequest[]>(
        WITHDRAWAL_REQUESTS_QUERY_KEY,
        (currentRequests = []) => {
          const hasExistingRequest = currentRequests.some(
            (request) => request.id === updatedRequest.id
          )

          if (!hasExistingRequest) {
            return [updatedRequest, ...currentRequests]
          }

          return currentRequests.map((request) =>
            request.id === updatedRequest.id ? updatedRequest : request
          )
        }
      )

      queryClient.invalidateQueries({ queryKey: requestQueryKey, refetchType: 'active' })
      queryClient.invalidateQueries({
        queryKey: WITHDRAWAL_REQUESTS_QUERY_KEY,
        refetchType: 'active',
      })
    },
  })
}
