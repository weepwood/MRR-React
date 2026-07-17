import type { ReactNode } from "react"
import { Navigate, createBrowserRouter, useLocation, useParams } from "react-router-dom"
import { AppShell } from "@/app/app-shell"
import { authEnabled, useAuthStore } from "@/lib/auth"
import { ArchivePage } from "@/pages/archive"
import { ArchiveBoxesPage } from "@/pages/archive-boxes"
import { AuditImagesPage } from "@/pages/audit-images"
import { DashboardPage } from "@/pages/dashboard"
import { HelpPage } from "@/pages/help"
import { LoginPage } from "@/pages/login"
import { LogsPage } from "@/pages/logs"
import { MonitoringPage, StatusPage } from "@/pages/monitoring"
import { NotFoundPage } from "@/pages/not-found"
import { OssMigrationPage } from "@/pages/oss-migration"
import { PatientsPage } from "@/pages/patients"
import { PermissionsPage } from "@/pages/permissions"
import { RecordsPage } from "@/pages/records"
import { ResponseAnalysisPage } from "@/pages/response-analysis"
import { SettingsPage } from "@/pages/settings"
import { StatisticsPage } from "@/pages/statistics"
import { UsersPage } from "@/pages/users"
function Protected({children}:{children:ReactNode}){const token=useAuthStore(s=>s.token),location=useLocation();if(authEnabled&&!token)return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname+location.search)}`} replace/>;return children}
function LegacyIdCardRedirect(){const {idCard}=useParams();return <Navigate to={idCard?`/archive?idcard=${encodeURIComponent(idCard)}`:"/archive"} replace/>}
function LegacyArchiveRedirect(){const {bah}=useParams();return <Navigate to={bah?`/archive?bah=${encodeURIComponent(bah)}`:"/archive"} replace/>}
export const router=createBrowserRouter([
 {path:"/login",element:<LoginPage/>},
 {path:"/status",element:<StatusPage/>},
 {path:"/idcard",element:<Navigate to="/archive" replace/>},
 {path:"/idcard/:idCard",element:<LegacyIdCardRedirect/>},
 {path:"/archive",element:<ArchivePage/>},
 {path:"/archive/:bah",element:<LegacyArchiveRedirect/>},
 {path:"/",element:<Protected><AppShell/></Protected>,children:[
  {index:true,element:<DashboardPage/>},{path:"records",element:<RecordsPage/>},{path:"patients",element:<PatientsPage/>},{path:"statistics",element:<StatisticsPage/>},{path:"statistics-detail",element:<StatisticsPage detailOnly/>},{path:"records-statistics",element:<Navigate to="/statistics" replace/>},{path:"archive-boxes",element:<ArchiveBoxesPage/>},{path:"oss-migration",element:<OssMigrationPage/>},{path:"archive/embed",element:<ArchivePage/>},{path:"users",element:<UsersPage/>},{path:"permissions",element:<PermissionsPage/>},{path:"settings",element:<SettingsPage/>},{path:"logs",element:<LogsPage/>},{path:"audit-images",element:<AuditImagesPage/>},{path:"monitoring",element:<MonitoringPage/>},{path:"system-status",element:<Navigate to="/status" replace/>},{path:"response-analysis",element:<ResponseAnalysisPage/>},{path:"help",element:<HelpPage/>},{path:"*",element:<NotFoundPage/>}
 ]},
 {path:"*",element:<NotFoundPage/>}
])
