'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/lib/context/AuthContext'
import { LanguageSwitcher } from './LanguageSwitcher'
import { User, LogOut } from 'lucide-react'

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
    <header className="sticky top-0 z-10 border-b border-border bg-background">
      <div className="flex items-center justify-between px-6 py-4 md:px-8">
        <div>
          {title ? <h1 className="text-2xl font-bold text-foreground">{title}</h1> : null}
          {description && (
            <p className="text-sm text-muted mt-1">{description}</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />

          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="rounded-xl border border-border bg-background p-2 text-foreground transition-colors hover:bg-secondary"
            >
              <User size={20} />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-full z-50 mt-2 min-w-52 overflow-hidden rounded-2xl border border-border bg-background shadow-lg">
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-sm text-muted">{t('dashboard.profile')}</p>
                  <p className="text-sm font-semibold text-foreground">
                    {user?.fullName || user?.login}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-4 py-3 text-left text-foreground transition-colors hover:bg-secondary"
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
