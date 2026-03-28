'use client'

import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

interface AdminLayoutProps {
  children: React.ReactNode
  title: string
  description?: string
  searchPlaceholder?: string
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
    },
  },
})

export function AdminLayout({
  children,
  title,
  description,
  searchPlaceholder,
}: AdminLayoutProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <Header 
            title={title} 
            description={description}
            searchPlaceholder={searchPlaceholder}
          />

          <main className="flex-1 overflow-y-auto bg-background p-6">
            <div className="mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </QueryClientProvider>
  )
}
