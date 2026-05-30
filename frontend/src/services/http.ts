import axios from "axios"

import { clearStoredSession, getAccessToken } from "@/lib/authStorage"

/**
 * Central Axios instance with auth interceptors.
 */
export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "/api/v1",
  timeout: 30_000,
  headers: {
    "Content-Type": "application/json",
  },
})

http.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const url = error.config?.url ?? ""
      const isAuthRoute = url.includes("/auth/login") || url.includes("/auth/register")
      if (!isAuthRoute) {
        clearStoredSession()
      }
    }
    return Promise.reject(error)
  }
)
