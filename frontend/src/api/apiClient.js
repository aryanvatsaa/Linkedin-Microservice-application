import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
})

apiClient.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('nexora.accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem('nexora.accessToken')
      sessionStorage.removeItem('nexora.user')
      window.dispatchEvent(new Event('nexora:unauthorized'))
    }
    return Promise.reject(error)
  },
)

export default apiClient
