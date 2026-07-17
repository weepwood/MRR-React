import { Activity, Archive, BarChart3, Box, CloudUpload, FileClock, FileSearch, FolderOpen, Gauge, HelpCircle, Home, Images, KeyRound, Settings, ShieldCheck, Table2, Users } from "lucide-react"
export const navigation = [
  { label: "概览", items: [{ label: "主页", path: "/", icon: Home }] },
  { label: "业务", items: [
    { label: "记录管理", path: "/records", icon: Table2 },
    { label: "患者管理", path: "/patients", icon: Users },
    { label: "病案扫描统计", path: "/statistics", icon: BarChart3 },
    { label: "统计明细", path: "/statistics-detail", icon: FileSearch },
    { label: "档案装箱", path: "/archive-boxes", icon: Box },
    { label: "OSS 迁移管理", path: "/oss-migration", icon: CloudUpload },
    { label: "影像档案袋", path: "/archive/embed", icon: FolderOpen },
  ]},
  { label: "系统", items: [
    { label: "用户管理", path: "/users", icon: Users },
    { label: "权限管理", path: "/permissions", icon: KeyRound },
    { label: "系统设置", path: "/settings", icon: Settings },
  ]},
  { label: "运维", items: [
    { label: "日志管理", path: "/logs", icon: FileClock },
    { label: "图片访问审计", path: "/audit-images", icon: ShieldCheck },
    { label: "系统监控", path: "/monitoring", icon: Gauge },
    { label: "服务状态", path: "/status", icon: Activity },
    { label: "接口响应分析", path: "/response-analysis", icon: Archive },
  ]},
  { label: "帮助", items: [{ label: "帮助与文档", path: "/help", icon: HelpCircle }] },
]
