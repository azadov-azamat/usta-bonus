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

        <div className="flex flex-col flex-1 w-full lg:ml-0">
          <Header title={title} description={description} />

          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </QueryClientProvider>
  )
}
