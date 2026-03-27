'use client'

import React from 'react'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children: React.ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const baseClasses = 'flex items-center justify-center gap-2 rounded-xl border text-sm font-medium transition-colors duration-200'

  const variantClasses = {
    primary: 'border-foreground bg-foreground text-background hover:opacity-90 disabled:opacity-50',
    secondary: 'border-border bg-background text-foreground hover:bg-secondary disabled:opacity-50',
    danger: 'border-foreground bg-foreground text-background hover:opacity-90 disabled:opacity-50',
    ghost: 'border-border bg-secondary text-foreground hover:bg-border disabled:opacity-50',
  }

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  return (
    <button
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {loading ? <Loader2 size={18} className="animate-spin" /> : null}
      {children}
    </button>
  )
}
