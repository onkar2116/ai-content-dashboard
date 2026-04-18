import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
})

// Response interceptor for rate limiting and common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after']
      const minutes = retryAfter ? Math.ceil(retryAfter / 60) : 15
      error.response.data = {
        ...error.response.data,
        message: error.response.data?.message || `Rate limit reached. Please wait ${minutes} minute${minutes > 1 ? 's' : ''} and try again.`,
        isRateLimit: true,
      }
    }

    if (error.response?.status === 413) {
      error.response.data = {
        message: 'Content too large. Please reduce the text size and try again.',
      }
    }

    if (!error.response) {
      error.response = {
        data: { message: 'Network error. Please check your connection and try again.' },
      }
    }

    return Promise.reject(error)
  }
)

export default api
