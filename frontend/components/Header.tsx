'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/lib/context/AuthContext'
import { LanguageSwitcher } from './LanguageSwitcher'
import { LogOut, Search, ChevronDown } from 'lucide-react'

interface HeaderProps {
  title: string
  description?: string
  searchPlaceholder?: string
}

function HeaderSearch({ placeholder = 'Search...' }: { placeholder?: string }) {
  return (
    <div className="hidden md:flex items-center bg-surface border border-border rounded-md px-3 py-2 w-80">
      <Search size={16} className="text-text-secondary mr-2" />
      <input
        type="text"
        placeholder={placeholder}
        className="flex-1 bg-transparent text-sm placeholder-text-secondary text-foreground outline-none"
      />
    </div>
  )
}

interface UserMenuProps {
  isOpen: boolean
  onToggle: () => void
  userName: string | undefined
  onLogout: () => void
  logoutLabel: string
  profileLabel: string
}

function UserMenu({ 
  isOpen, 
  onToggle, 
  userName, 
  onLogout, 
  logoutLabel, 
  profileLabel 
}: UserMenuProps) {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="flex items-center gap-2 px-3 py-2 rounded-md bg-surface border border-border text-foreground text-sm font-medium hover:bg-surface-hover transition-colors"
      >
        <span>{userName}</span>
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-48 bg-background border border-border rounded-md shadow-lg overflow-hidden">
          <div className="px-3 py-3 border-b border-border">
            <p className="text-xs text-text-secondary">{profileLabel}</p>
            <p className="text-sm font-semibold text-foreground truncate">{userName}</p>
          </div>
          <button
            onClick={onLogout}
            className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-error hover:bg-surface transition-colors"
          >
            <LogOut size={16} />
            <span>{logoutLabel}</span>
          </button>
        </div>
      )}
    </div>
  )
}

export function Header({ title, description, searchPlaceholder }: HeaderProps) {
  const router = useRouter()
  const { t } = useTranslation()
  const { logout, user } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  const userName = user?.fullName || user?.login || 'User'
  const searchText = searchPlaceholder || t('dashboard.searchVehicles') || 'Search vehicles...'

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex-1">
          {title && <h1 className="text-2xl font-bold text-foreground">{title}</h1>}
          {description && <p className="text-sm text-text-secondary mt-1">{description}</p>}
        </div>

        <div className="flex items-center gap-4">
          <HeaderSearch placeholder={searchText} />
          
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            
            <UserMenu
              isOpen={showUserMenu}
              onToggle={() => setShowUserMenu(!showUserMenu)}
              userName={userName}
              onLogout={handleLogout}
              logoutLabel={t('common.logout') || 'Logout'}
              profileLabel={t('dashboard.profile') || 'Profile'}
            />
          </div>
        </div>
      </div>
    </header>
  )
}
