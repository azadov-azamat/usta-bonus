import { useAuth } from '../context/AuthContext'

export function useSession() {
  const { user, token, isAuthenticated, isLoading } = useAuth()

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
  }
}
