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

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-40 lg:hidden p-2 rounded-lg bg-primary text-white"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-foreground text-background transform transition-transform duration-300 z-30 lg:relative lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full p-6">
          {/* Logo */}
          <div className="mb-8 mt-12 lg:mt-0">
            <h1 className="text-2xl font-bold">Usta Bonus</h1>
            <p className="text-sm opacity-75">Admin Panel</p>
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
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-background/80 hover:bg-background/10'
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
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-background/80 hover:bg-background/10 transition-colors w-full text-left"
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
