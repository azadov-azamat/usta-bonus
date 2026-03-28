import axios from 'axios'

export const API_ERROR_EVENT = 'app:api-error'
const SERVER_ERROR_MESSAGE = 'Server error'
const DEFAULT_ERROR_MESSAGE = 'So‘rovni bajarishda xatolik yuz berdi.'

export interface ApiErrorDetails {
  status?: number
  message: string
  rawMessage?: string
}

export function normalizeApiError(error: unknown): ApiErrorDetails {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status
    const payload = error.response?.data
    const rawMessage =
      typeof payload?.message === 'string'
        ? payload.message
        : typeof error.message === 'string'
          ? error.message
          : undefined

    if (status && status >= 500) {
      return {
        status,
        message: SERVER_ERROR_MESSAGE,
        rawMessage,
      }
    }

    return {
      status,
      message: rawMessage || DEFAULT_ERROR_MESSAGE,
      rawMessage,
    }
  }

  if (error instanceof Error) {
    return {
      message: error.message || DEFAULT_ERROR_MESSAGE,
      rawMessage: error.message || undefined,
    }
  }

  return {
    message: DEFAULT_ERROR_MESSAGE,
  }
}

export function emitApiErrorToast(error: unknown) {
  if (typeof window === 'undefined') {
    return
  }

  const detail = normalizeApiError(error)

  window.dispatchEvent(
    new CustomEvent<ApiErrorDetails>(API_ERROR_EVENT, {
      detail,
    })
  )
}

export function logServerError(error: unknown) {
  const detail = normalizeApiError(error)

  if (!detail.status || detail.status < 500) {
    return
  }

  console.error('API server error:', {
    status: detail.status,
    message: detail.rawMessage || detail.message,
  })
}
