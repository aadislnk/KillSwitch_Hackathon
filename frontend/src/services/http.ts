import axios from "axios"

/**
 * Central Axios instance.
 *
 * Later we'll add:
 * - auth interceptors
 * - request IDs / tracing headers
 * - typed error mapping
 */
export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "/api/v1",
  timeout: 30_000,
  headers: {
    "Content-Type": "application/json",
  },
})
