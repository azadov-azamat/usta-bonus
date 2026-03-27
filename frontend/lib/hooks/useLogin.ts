import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export function useLogin() {
  const { login } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (login: string, password: string) => {
    try {
      setIsLoading(true)
      setError(null)
      await login(login, password)
      return true
    } catch (err: any) {
      const errorMsg = err.message || 'Login failed'
      setError(errorMsg)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return {
    login: handleLogin,
    isLoading,
    error,
  }
}
