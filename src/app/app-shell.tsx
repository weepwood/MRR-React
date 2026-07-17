import { useEffect, useState } from "react"
import { Link, NavLink, Outlet, useLocation } from "react-router-dom"
import { LogOut, Menu, Moon, PanelLeftClose, PanelLeftOpen, Sun, X } from "lucide-react"
import { navigation } from "@/app/navigation"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { authEnabled, useAuthStore } from "@/lib/auth"
import { applyTheme, useThemeStore } from "@/lib/theme"
import { cn } from "@/lib/utils"

export function AppShell() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const { profile, clearSession } = useAuthStore()
  const { theme, setTheme } = useThemeStore()
  useEffect(() => applyTheme(theme), [theme])
  useEffect(() => setMobileOpen(false), [location.pathname])
  const nextTheme = theme === "dark" ? "light" : "dark"
  return <div className="min-h-svh bg-muted/30">
    {mobileOpen && <button aria-label="关闭导航" className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileOpen(false)} />}
    <aside className={cn("fixed inset-y-0 left-0 z-50 flex border-r bg-background transition-all duration-200 lg:z-30", collapsed ? "w-20" : "w-64", mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0") }>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-16 items-center gap-3 border-b px-4"><Link to="/" className="flex min-w-0 flex-1 items-center gap-3"><div className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">MR</div>{!collapsed && <div className="min-w-0"><p className="truncate text-sm font-semibold">MRR</p><p className="truncate text-xs text-muted-foreground">病案文件管理系统</p></div>}</Link><Button className="lg:hidden" variant="ghost" size="icon" onClick={() => setMobileOpen(false)}><X /></Button></div>
        <nav className="flex-1 overflow-y-auto px-3 py-4">{navigation.map((group) => <div key={group.label} className="mb-5">{!collapsed && <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{group.label}</p>}<div className="space-y-1">{group.items.map((item) => <NavLink key={item.path} to={item.path} end={item.path === "/"} title={collapsed ? item.label : undefined} className={({ isActive }) => cn("flex h-10 items-center gap-3 rounded-lg px-3 text-sm transition-colors", isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground", collapsed && "justify-center px-0")}><item.icon className="size-4 shrink-0" />{!collapsed && <span className="truncate">{item.label}</span>}</NavLink>)}</div></div>)}</nav>
        <div className="border-t p-3"><Button className="hidden w-full justify-start lg:flex" variant="ghost" onClick={() => setCollapsed(!collapsed)}>{collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}{!collapsed && "收起侧栏"}</Button></div>
      </div>
    </aside>
    <div className={cn("transition-[padding] duration-200", collapsed ? "lg:pl-20" : "lg:pl-64")}>
      <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-background/90 px-4 backdrop-blur sm:px-6"><Button className="lg:hidden" variant="ghost" size="icon" onClick={() => setMobileOpen(true)}><Menu /></Button><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{navigation.flatMap(g => g.items).find(i => i.path === location.pathname)?.label || "MRR"}</p><p className="hidden text-xs text-muted-foreground sm:block">React + shadcn/ui 管理端</p></div><Button variant="ghost" size="icon" title="切换主题" onClick={() => setTheme(nextTheme)}>{theme === "dark" ? <Sun /> : <Moon />}</Button>{authEnabled && <><Separator orientation="vertical" className="h-6" /><div className="hidden text-right sm:block"><p className="text-sm font-medium">{profile?.displayName || profile?.username || "用户"}</p><p className="text-xs text-muted-foreground">{profile?.roleName || profile?.roleCode}</p></div><Button variant="ghost" size="icon" title="退出登录" onClick={() => { clearSession(); window.location.assign("/login") }}><LogOut /></Button></>}</header>
      <main className="mx-auto w-full max-w-[1800px] space-y-6 p-4 sm:p-6 lg:p-8"><Outlet /></main>
    </div>
  </div>
}
