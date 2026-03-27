import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

// Users API
export const usersAPI = {
  getAll: () => api.get('/api/admin/users'),
  getById: (id: string) => api.get(`/api/admin/users/${id}`),
}

// Products API
export const productsAPI = {
  getAll: () => api.get('/api/admin/products'),
  getById: (id: string) => api.get(`/api/admin/products/${id}`),
  importExcel: (file: FormData) => 
    api.post('/api/admin/products/import', file, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
}

// Promo Codes API
export const promoCodesAPI = {
  getByProduct: (productId: string) => 
    api.get(`/api/admin/products/${productId}`).then(res => ({
      data: res.data.item?.promoCodes || []
    })),
}

// Withdrawal Requests API
export const withdrawalAPI = {
  getAll: () => api.get('/api/admin/withdrawals').then(res => ({
    data: res.data.items || []
  })),
  getById: (id: string) => api.get(`/api/admin/withdrawals/${id}`),
  uploadImage: (id: string, file: FormData) =>
    api.post(`/api/admin/withdrawals/${id}/complete`, file, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
}
