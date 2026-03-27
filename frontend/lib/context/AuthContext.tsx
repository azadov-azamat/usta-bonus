import React, { createContext, useContext, useEffect, useState } from 'react'
import { api } from '../api'

export interface AuthUser {
  id: string
  fullName: string
  login: string
  role?: string
}

interface AuthContextType {
  user: AuthUser | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (login: string, password: string) => Promise<void>
  logout: () => Promise<void>
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function mapAuthUser(payload: unknown): AuthUser | null {
  if (!payload || typeof payload !== 'object') {
    return null
  }

  const item = payload as Record<string, unknown>
  const userId =
    typeof item.id === 'string' || typeof item.id === 'number'
      ? String(item.id)
      : null

  if (!userId || typeof item.login !== 'string') {
    return null
  }

  return {
    id: userId,
    login: item.login,
    fullName: typeof item.fullName === 'string' ? item.fullName : 'Admin',
    role: typeof item.role === 'string' ? item.role : undefined,
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSession = async () => {
    const response = await api.get('/api/admin/auth/session', {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
      params: {
        _t: Date.now(),
      },
    })

    return mapAuthUser(response.data?.item)
  }

  useEffect(() => {
    let isMounted = true

    async function restoreSession() {
      try {
        const sessionUser = await fetchSession()

        if (isMounted) {
          setUser(sessionUser)
        }
      } catch {
        if (isMounted) {
          setUser(null)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    restoreSession()

    return () => {
      isMounted = false
    }
  }, [])

  const login = async (login: string, password: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await api.post('/api/admin/auth/login', {
        login: login.trim().toLowerCase(),
        password,
      })
      const admin = mapAuthUser(response.data?.item) || (await fetchSession())

      if (!admin) {
        throw new Error('Login response format is invalid.')
      }

      setUser(admin)
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Login failed. Please try again.'
      setError(errorMsg)
      throw new Error(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      await api.post('/api/admin/auth/logout')
    } finally {
      setUser(null)
      setError(null)
    }
  }

  const value: AuthContextType = {
    user,
    token: null,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    error,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
