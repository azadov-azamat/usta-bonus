import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { usersAPI } from '../api'

export interface User {
  id: string
  fullName: string
  username?: string
  phoneNumber?: string
  balance: number
  createdAt: string
  totalEarned?: number
  totalWithdrawn?: number
}

export function useUsers(): UseQueryResult<User[]> {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await usersAPI.getAll()
      const data = response.data
      const items = data.items || data.data || []
      return items.map((user: any) => ({
        id: user.id,
        fullName: user.fullName || user.name || `User ${user.id}`,
        username: user.username,
        phoneNumber: user.phoneNumber,
        balance: user.balance || 0,
        createdAt: user.createdAt,
        totalEarned: user.totalEarned || 0,
        totalWithdrawn: user.totalWithdrawn || 0,
      }))
    },
  })
}

export function useUser(id: string) {
  return useQuery({
    queryKey: ['user', id],
    queryFn: async () => {
      const response = await usersAPI.getById(id)
      const user = response.data.item || response.data
      return {
        id: user.id,
        fullName: user.fullName || user.name,
        username: user.username,
        phoneNumber: user.phoneNumber,
        balance: user.balance || 0,
        createdAt: user.createdAt,
        totalEarned: user.totalEarned || 0,
        totalWithdrawn: user.totalWithdrawn || 0,
      }
    },
    enabled: !!id,
  })
}
