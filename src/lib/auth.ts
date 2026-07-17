import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { AuthUser } from "@/types/api"

interface AuthState {
  token: string
  profile: AuthUser | null
  setSession: (token: string, profile?: AuthUser | null) => void
  clearSession: () => void
}
export const useAuthStore = create<AuthState>()(persist((set) => ({
  token: "",
  profile: null,
  setSession: (token, profile = null) => set({ token, profile }),
  clearSession: () => set({ token: "", profile: null }),
}), { name: "MRR-REACT:auth" }))

export const authEnabled = String(import.meta.env.VITE_AUTH_ENABLED || "false").toLowerCase() === "true"
