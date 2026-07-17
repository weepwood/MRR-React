import { useQuery } from "@tanstack/react-query"
import { Activity, Database, FileText, Images, Users } from "lucide-react"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { statisticsApi, systemApi } from "@/api/mrr"
import { MetricCard } from "@/components/shared/metric-card"
import { PageHeader } from "@/components/shared/page-header"
import { ErrorState, LoadingState } from "@/components/shared/data-state"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function DashboardPage() {
  const dashboard = useQuery({ queryKey: ["dashboard"], queryFn: statisticsApi.dashboard })
  const health = useQuery({ queryKey: ["health"], queryFn: systemApi.health, refetchInterval: 30_000 })
  if (dashboard.isLoading) return <LoadingState />
  if (dashboard.error) return <ErrorState error={dashboard.error} retry={() => dashboard.refetch()} />
  const data = dashboard.data || {}
  const overview = data.overview || {}
  const trend = (data.recentTrend || []).map((item) => ({ date: item.date?.slice(5), records: item.recordCount || 0, pages: item.totalPages || item.pages || 0 }))
  return <>
    <PageHeader eyebrow="Overview" title="工作台" description="集中查看病案扫描规模、近期趋势与系统健康状态。" />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard label="总记录数" value={overview.totalRecords} icon={FileText} />
      <MetricCard label="总页数" value={overview.totalPages} icon={Images} />
      <MetricCard label="病案数" value={data.uniqueBAHCount} icon={Users} />
      <MetricCard label="服务状态" value={health.data?.status === "UP" ? "正常" : health.data?.status || "未知"} icon={Activity} />
    </div>
    <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
      <Card><CardHeader><CardTitle>近期扫描趋势</CardTitle><CardDescription>按日展示扫描记录数与页数。</CardDescription></CardHeader><CardContent className="h-[360px]">{trend.length ? <ResponsiveContainer width="100%" height="100%"><AreaChart data={trend}><defs><linearGradient id="pages" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="currentColor" stopOpacity={0.35}/><stop offset="95%" stopColor="currentColor" stopOpacity={0}/></linearGradient></defs><CartesianGrid vertical={false} strokeDasharray="3 3" /><XAxis dataKey="date" tickLine={false} axisLine={false} /><YAxis tickLine={false} axisLine={false} width={50} /><Tooltip /><Area type="monotone" dataKey="pages" name="扫描页数" stroke="currentColor" fill="url(#pages)" /></AreaChart></ResponsiveContainer> : <div className="grid h-full place-items-center text-sm text-muted-foreground">暂无趋势数据</div>}</CardContent></Card>
      <Card><CardHeader><CardTitle>系统健康</CardTitle><CardDescription>每 30 秒自动刷新。</CardDescription></CardHeader><CardContent className="space-y-3">{Object.entries(health.data?.components || {}).map(([key, value]) => <div key={key} className="flex items-center justify-between rounded-lg border p-3"><div className="flex items-center gap-2"><Database className="size-4 text-muted-foreground" /><span className="text-sm">{key}</span></div><Badge variant={value.status === "UP" ? "success" : "destructive"}>{value.status || "UNKNOWN"}</Badge></div>)}{!Object.keys(health.data?.components || {}).length && <p className="text-sm text-muted-foreground">未返回组件健康信息。</p>}</CardContent></Card>
    </div>
  </>
}
