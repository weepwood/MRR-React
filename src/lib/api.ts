import axios, { type AxiosRequestConfig } from "axios"
import { useAuthStore } from "@/lib/auth"

interface ApiEnvelope<T> { code?: number; status?: number | string; message?: string; data?: T }
const client = axios.create({
  baseURL: import.meta.env.DEV ? "/proxy" : (import.meta.env.VITE_APP_API_BASEURL || ""),
  timeout: 60_000,
})
client.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})
client.interceptors.response.use((response) => response, (error) => {
  if (error?.response?.status === 401) {
    useAuthStore.getState().clearSession()
    if (!location.pathname.startsWith("/login")) location.assign(`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`)
  }
  const message = error?.response?.data?.message || error?.message || "请求失败"
  return Promise.reject(new Error(message))
})

function unwrap<T>(payload: ApiEnvelope<T> | T): T {
  if (payload && typeof payload === "object") {
    const envelope = payload as ApiEnvelope<T>
    if (typeof envelope.code === "number") {
      if (envelope.code !== 200) throw new Error(envelope.message || `请求失败（${envelope.code}）`)
      return (envelope.data ?? payload) as T
    }
    if (typeof envelope.status === "number") {
      if (envelope.status === 0) throw new Error(envelope.message || "请求失败")
      return (envelope.data ?? payload) as T
    }
  }
  return payload as T
}

export async function get<T>(url: string, config?: AxiosRequestConfig) { return unwrap<T>((await client.get(url, config)).data) }
export async function post<T>(url: string, data?: unknown, config?: AxiosRequestConfig) { return unwrap<T>((await client.post(url, data, config)).data) }
export async function put<T>(url: string, data?: unknown, config?: AxiosRequestConfig) { return unwrap<T>((await client.put(url, data, config)).data) }
export async function del<T>(url: string, config?: AxiosRequestConfig) { return unwrap<T>((await client.delete(url, config)).data) }
export async function blob(url: string, config?: AxiosRequestConfig) { return (await client.get<Blob>(url, { ...config, responseType: "blob" })).data }
export async function postBlob(url: string, data?: unknown, config?: AxiosRequestConfig) { return (await client.post<Blob>(url, data, { ...config, responseType: "blob" })).data }
export { client }
