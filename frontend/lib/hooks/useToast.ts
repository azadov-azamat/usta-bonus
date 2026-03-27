'use client'

import { toast as sonnerToast } from 'sonner'

export type ToastVariant = 'default' | 'success' | 'error'

export interface ToastOptions {
  title: string
  description?: string
  variant?: ToastVariant
  duration?: number
}

export function dismissToast(id?: string | number) {
  sonnerToast.dismiss(id)
}

export function toast({
  duration = 4000,
  variant = 'default',
  title,
  description,
}: ToastOptions) {
  if (variant === 'success') {
    return sonnerToast.success(title, { description, duration })
  }

  if (variant === 'error') {
    return sonnerToast.error(title, { description, duration })
  }

  return sonnerToast(title, { description, duration })
}

export function useToast() {
  return {
    toast,
    dismiss: dismissToast,
  }
}
