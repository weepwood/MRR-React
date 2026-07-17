import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { RouterProvider } from "react-router-dom"
import { Toaster } from "sonner"
import { router } from "@/app/router"
import { applyTheme, useThemeStore } from "@/lib/theme"
import "@/index.css"
applyTheme(useThemeStore.getState().theme)
const queryClient=new QueryClient({defaultOptions:{queries:{retry:1,staleTime:30_000,refetchOnWindowFocus:false},mutations:{retry:0}}})
createRoot(document.getElementById("root")!).render(<StrictMode><QueryClientProvider client={queryClient}><RouterProvider router={router}/><Toaster richColors position="top-right"/></QueryClientProvider></StrictMode>)
