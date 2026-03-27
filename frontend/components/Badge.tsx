'use client'

import React from 'react'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger'
}

export function Badge({ children, variant = 'default' }: BadgeProps) {
  const variantClasses = {
    default: 'border border-border bg-secondary text-foreground',
    success: 'bg-foreground text-background',
    warning: 'border border-border bg-secondary text-foreground',
    danger: 'border border-border bg-zinc-100 text-zinc-700',
  }

  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]}`}>
      {children}
    </span>
  )
}
