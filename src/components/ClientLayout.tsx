'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import Header from './Header'

const queryClient = new QueryClient()

export default function ClientLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div>
      <QueryClientProvider client={queryClient}>
        <Header />
        {children}
      </QueryClientProvider>
      <Toaster />
    </div>
  )
}
