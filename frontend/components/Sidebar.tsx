'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { usePathname } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/lib/context/AuthContext'
import { Menu, X, Car, Image as ImageIcon, Wrench, ShoppingCart } from 'lucide-react'

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ size: number }>
}

function SidebarLogo() {
  return (
    <div className="border-b border-border pb-4">
      <div className="flex items-center gap-2">
        <Car size={24} className="text-primary" />
        <span className="text-lg font-semibold text-foreground">VehicleHub</span>
      </div>
    </div>
  )
}

interface SidebarNavProps {
  items: NavItem[]
  currentPath: string
  onNavigate: () => void
}

function SidebarNav({ items, currentPath, onNavigate }: SidebarNavProps) {
  return (
    <nav className="space-y-0.5">
      {items.map((item) => {
        const Icon = item.icon
        const isActive = currentPath === item.href
        
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors rounded-md ${
              isActive
                ? 'bg-primary text-white'
                : 'text-text-secondary hover:text-foreground hover:bg-surface-hover'
            }`}
          >
            <Icon size={18} />
            <span>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

interface SidebarFooterProps {
  onLogout: () => void
  logoutLabel: string
}

function SidebarFooter({ onLogout, logoutLabel }: SidebarFooterProps) {
  return (
    <button
      onClick={onLogout}
      className="flex w-full items-center gap-3 px-3 py-2.5 text-sm font-medium text-error transition-colors rounded-md hover:bg-surface-hover"
    >
      <X size={18} />
      <span>{logoutLabel}</span>
    </button>
  )
}

export function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const { t } = useTranslation()
  const { logout } = useAuth()
  const [isOpen, setIsOpen] = React.useState(false)

  const navItems: NavItem[] = [
    { label: t('dashboard.vehicles') || 'Vehicles', href: '/vehicles', icon: Car },
    { label: t('dashboard.media') || 'Media', href: '/media', icon: ImageIcon },
    { label: t('dashboard.services') || 'Services', href: '/services', icon: Wrench },
    { label: t('dashboard.purchasing') || 'Purchasing', href: '/purchasing', icon: ShoppingCart },
  ]

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  const handleNavigate = () => {
    setIsOpen(false)
  }

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed left-4 top-4 z-40 rounded-md p-2 bg-surface border border-border text-foreground lg:hidden"
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-30 h-screen w-56 bg-background border-r border-border transition-transform duration-300 lg:relative lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col p-4">
          <SidebarLogo />
          
          <div className="flex-1 py-6">
            <SidebarNav 
              items={navItems} 
              currentPath={pathname} 
              onNavigate={handleNavigate}
            />
          </div>
          
          <SidebarFooter 
            onLogout={handleLogout}
            logoutLabel={t('common.logout') || 'Logout'}
          />
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  )
}
