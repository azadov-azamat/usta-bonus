'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/lib/context/AuthContext'
import { LanguageSwitcher } from './LanguageSwitcher'
import { Bell, Settings, User, LogOut } from 'lucide-react'

interface HeaderProps {
  title: string
  description?: string
}

export function Header({ title, description }: HeaderProps) {
  const router = useRouter()
  const { t } = useTranslation()
  const { logout, user } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  return (
    <header className="bg-white dark:bg-slate-950 border-b border-border sticky top-0 z-10">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          {description && (
            <p className="text-sm text-muted mt-1">{description}</p>
          )}
        </div>

        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          
          <button className="p-2 hover:bg-muted/10 rounded-lg transition-colors">
            <Bell size={20} className="text-muted" />
          </button>
          
          <button className="p-2 hover:bg-muted/10 rounded-lg transition-colors">
            <Settings size={20} className="text-muted" />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="p-2 hover:bg-muted/10 rounded-lg transition-colors"
            >
              <User size={20} className="text-muted" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 bg-background border border-border rounded-lg shadow-lg overflow-hidden z-50 min-w-48">
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-sm text-muted">{t('dashboard.profile')}</p>
                  <p className="text-sm font-semibold text-foreground">
                    {user?.fullName || user?.login}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 flex items-center gap-2 hover:bg-secondary text-foreground transition-colors"
                >
                  <LogOut size={16} />
                  <span className="text-sm">{t('common.logout')}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
