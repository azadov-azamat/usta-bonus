import React, { createContext, useContext, useEffect, useState } from 'react'
import Cookies from 'js-cookie'
import { api } from '../api'

export interface AuthUser {
  id: string
  fullName: string
  username: string
  phoneNumber?: string
}

interface AuthContextType {
  user: AuthUser | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const TOKEN_KEY = 'admin_token'
const USER_KEY = 'admin_user'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Initialize auth from cookies/storage
  useEffect(() => {
    const storedToken = Cookies.get(TOKEN_KEY)
    const storedUser = localStorage.getItem(USER_KEY)

    if (storedToken) {
      setToken(storedToken)
      api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`
    }

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (err) {
        console.error('[v0] Failed to parse stored user:', err)
      }
    }

    setIsLoading(false)
  }, [])

  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await api.post('/api/admin/auth/login', {
        username,
        password,
      })

      const { token: newToken, admin } = response.data

      // Store token in secure cookie
      Cookies.set(TOKEN_KEY, newToken, {
        expires: 7,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      })

      // Store user in localStorage
      localStorage.setItem(USER_KEY, JSON.stringify(admin))

      // Set API default header
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`

      setToken(newToken)
      setUser(admin)
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Login failed. Please try again.'
      setError(errorMsg)
      throw new Error(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    Cookies.remove(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    delete api.defaults.headers.common['Authorization']
    setToken(null)
    setUser(null)
    setError(null)
  }

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!token && !!user,
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
