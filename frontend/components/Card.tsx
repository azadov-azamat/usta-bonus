'use client'

import React from 'react'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function Card({ children, className = '', ...props }: CardProps) {
  return (
    <div
      className={`bg-white dark:bg-slate-950 rounded-lg border border-border shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
