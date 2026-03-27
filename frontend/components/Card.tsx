'use client'

import React from 'react'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function Card({ children, className = '', ...props }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-border bg-background shadow-[0_1px_2px_rgba(0,0,0,0.04)] ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
