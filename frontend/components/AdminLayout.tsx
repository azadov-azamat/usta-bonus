'use client'

import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

interface AdminLayoutProps {
  children: React.ReactNode
  title: string
  description?: string
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
    },
  },
})

export function AdminLayout({
  children,
  title,
  description,
}: AdminLayoutProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar />

        <div className="flex min-w-0 flex-1 flex-col bg-background">
          <Header title={title} description={description} />

          <main className="flex-1 overflow-y-auto bg-background p-6 md:p-8">
            {children}
          </main>
        </div>
      </div>
    </QueryClientProvider>
  )
}
