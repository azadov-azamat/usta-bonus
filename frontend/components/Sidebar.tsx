'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { usePathname } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/lib/context/AuthContext'
import {
  Users,
  Package,
  FileText,
  Menu,
  X,
  LogOut,
} from 'lucide-react'

export function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const { t } = useTranslation()
  const { logout } = useAuth()
  const [isOpen, setIsOpen] = React.useState(false)

  const navItems = [
    { label: t('dashboard.users'), href: '/users', icon: Users },
    { label: t('dashboard.products'), href: '/products', icon: Package },
    { label: t('withdrawals.title'), href: '/withdrawal-requests', icon: FileText },
  ]

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed left-4 top-4 z-40 rounded-xl border border-border bg-background p-2 text-foreground shadow-sm lg:hidden"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-30 h-screen w-64 transform border-r border-border bg-background text-foreground transition-transform duration-300 lg:relative lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col p-6">
          {/* Logo */}
          <div className="mb-10 mt-12 border-b border-border pb-6 lg:mt-0">
            <h1 className="text-2xl font-bold">Usta Bonus</h1>
            <p className="mt-1 text-sm text-muted">Admin Panel</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 transition-colors ${
                    isActive
                      ? 'bg-foreground text-background'
                      : 'text-foreground/70 hover:bg-secondary hover:text-foreground'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-foreground/70 transition-colors hover:bg-secondary hover:text-foreground"
          >
            <LogOut size={20} />
            <span className="font-medium">{t('common.logout')}</span>
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
