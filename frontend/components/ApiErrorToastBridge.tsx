'use client'

import React from 'react'
import { API_ERROR_EVENT, ApiErrorDetails } from '@/lib/api-error'
import { toast } from '@/lib/hooks/useToast'

const DEDUPE_WINDOW_MS = 1500

export function ApiErrorToastBridge() {
  const lastToastRef = React.useRef<{
    key: string
    timestamp: number
  } | null>(null)

  React.useEffect(() => {
    const handleApiError = (event: Event) => {
      const customEvent = event as CustomEvent<ApiErrorDetails>
      const detail = customEvent.detail

      if (!detail?.message) {
        return
      }

      const now = Date.now()
      const key = `${detail.status || 'na'}:${detail.message}`
      const lastToast = lastToastRef.current

      if (
        lastToast &&
        lastToast.key === key &&
        now - lastToast.timestamp < DEDUPE_WINDOW_MS
      ) {
        return
      }

      lastToastRef.current = {
        key,
        timestamp: now,
      }

      toast({
        title: detail.message,
        variant: 'error',
      })
    }

    window.addEventListener(API_ERROR_EVENT, handleApiError as EventListener)

    return () => {
      window.removeEventListener(API_ERROR_EVENT, handleApiError as EventListener)
    }
  }, [])

  return null
}
