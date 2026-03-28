import 'axios'

declare module 'axios' {
  interface AxiosRequestConfig {
    showErrorToast?: boolean
  }
}
