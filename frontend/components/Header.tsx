'use client'

import React from 'react'
import { Bell, Settings, User } from 'lucide-react'

interface HeaderProps {
  title: string
  description?: string
}

export function Header({ title, description }: HeaderProps) {
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
          <button className="p-2 hover:bg-muted/10 rounded-lg transition-colors">
            <Bell size={20} className="text-muted" />
          </button>
          <button className="p-2 hover:bg-muted/10 rounded-lg transition-colors">
            <Settings size={20} className="text-muted" />
          </button>
          <button className="p-2 hover:bg-muted/10 rounded-lg transition-colors">
            <User size={20} className="text-muted" />
          </button>
        </div>
      </div>
    </header>
  )
}
