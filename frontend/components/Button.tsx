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
  const baseClasses = 'font-medium rounded-lg transition-colors duration-200 flex items-center gap-2 justify-center'

  const variantClasses = {
    primary: 'bg-primary text-white hover:bg-blue-600 disabled:bg-blue-400',
    secondary: 'bg-secondary text-white hover:bg-purple-600 disabled:bg-purple-400',
    danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-500',
    ghost: 'bg-transparent text-foreground border border-border hover:bg-muted/10 disabled:opacity-50',
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
