'use client'

import React from 'react'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  title?: string
  subtitle?: string
  action?: React.ReactNode
}

export function Card({ 
  children, 
  className = '', 
  title,
  subtitle,
  action,
  ...props 
}: CardProps) {
  return (
    <div
      className={`rounded-md border border-border bg-background p-6 ${className}`}
      {...props}
    >
      {(title || subtitle || action) && (
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            {title && <h3 className="text-lg font-semibold text-foreground">{title}</h3>}
            {subtitle && <p className="text-sm text-text-secondary mt-1">{subtitle}</p>}
          </div>
          {action && <div className="flex-shrink-0 ml-4">{action}</div>}
        </div>
      )}
      {children}
    </div>
  )
}
