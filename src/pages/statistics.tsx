import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { BarChart3, Download, FileText, Layers3, RefreshCw } from "lucide-react"
import { Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { statisticsApi } from "@/api/mrr"
import { EmptyState, ErrorState, LoadingState } from "@/components/shared/data-state"
import { MetricCard } from "@/components/shared/metric-card"
import { PageHeader } from "@/components/shared/page-header"
import { Pager } from "@/components/shared/pager"
import { QueryCard, QueryField } from "@/components/shared/query-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { downloadBlob } from "@/lib/utils"

export function StatisticsPage({ detailOnly = false }: { detailOnly?: boolean }) {
  const [page,setPage]=useState(1), [size,setSize]=useState(detailOnly?50:100)
  const [filters,setFilters]=useState({keyword:"",type:"",startDate:"",endDate:""})
  const [applied,setApplied]=useState(filters)
  const summary=useQuery({queryKey:["statistics-summary"],queryFn:statisticsApi.summary,enabled:!detailOnly})
  const dates=useQuery({queryKey:["statistics-dates"],queryFn:statisticsApi.dates,enabled:!detailOnly})
  const list=useQuery({queryKey:["statistics-list",page,size,applied],queryFn:()=>statisticsApi.list({page,size,...applied,sortBy:"date",sortOrder:"desc"})})
  const chartData=useMemo(()=>(dates.data||[]).filter(i=>i.date&&i.date!=="NULL").slice(-90).map(i=>({date:i.date.replaceAll("/","-").slice(5),records:i.recordCount||0,pages:i.totalPages||i.pages||0})),[dates.data])
  const types=summary.data?.byType?.map(i=>i.type).filter(Boolean) as string[]|undefined
  async function exportCsv(){const blob=await statisticsApi.exportCsv(applied);downloadBlob(blob,`mrr-statistics-${Date.now()}.csv`)}
  return <><PageHeader eyebrow={detailOnly?"Statistics Detail":"Statistics"} title={detailOnly?"统计明细":"病案扫描统计"} description={detailOnly?"对扫描统计明细进行组合筛选、排序与导出。":"查看扫描记录、页数、病案数量以及最近 90 日变化趋势。"} actions={<><Button variant="outline" onClick={()=>list.refetch()}><RefreshCw/>刷新</Button><Button onClick={exportCsv}><Download/>导出 CSV</Button></>} />
  {!detailOnly&&<><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><MetricCard label="总记录数" value={summary.data?.total?.totalRecords} icon={FileText}/><MetricCard label="总页数" value={summary.data?.total?.totalPages} icon={Layers3}/><MetricCard label="病案数" value={summary.data?.uniqueBAHCount} icon={BarChart3}/><MetricCard label="病案类型" value={summary.data?.byType?.length} icon={Layers3}/></div><Card><CardHeader><CardTitle>近 90 日扫描趋势</CardTitle><CardDescription>柱形表示页数，折线表示记录数。</CardDescription></CardHeader><CardContent className="h-[380px]">{dates.isLoading?<LoadingState/>:<ResponsiveContainer width="100%" height="100%"><ComposedChart data={chartData}><CartesianGrid vertical={false} strokeDasharray="3 3"/><XAxis dataKey="date" tickLine={false} axisLine={false}/><YAxis yAxisId="left" tickLine={false} axisLine={false}/><YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false}/><Tooltip/><Bar yAxisId="left" dataKey="pages" name="扫描页数" fill="currentColor" opacity={0.22} radius={[4,4,0,0]}/><Line yAxisId="right" type="monotone" dataKey="records" name="记录数" stroke="currentColor" strokeWidth={2} dot={false}/></ComposedChart></ResponsiveContainer>}</CardContent></Card></>}
  <QueryCard><QueryField label="关键字"><Input value={filters.keyword} onChange={e=>setFilters({...filters,keyword:e.target.value})} placeholder="病案号 / 上架号 / 姓名"/></QueryField><QueryField label="病案类型"><select className="h-9 w-full rounded-md border bg-background px-3 text-sm" value={filters.type} onChange={e=>setFilters({...filters,type:e.target.value})}><option value="">全部类型</option>{types?.map(type=><option key={type}>{type}</option>)}</select></QueryField><QueryField label="开始日期"><Input type="date" value={filters.startDate} onChange={e=>setFilters({...filters,startDate:e.target.value})}/></QueryField><QueryField label="结束日期"><Input type="date" value={filters.endDate} onChange={e=>setFilters({...filters,endDate:e.target.value})}/></QueryField><Button onClick={()=>{setApplied(filters);setPage(1)}}>查询</Button><Button variant="ghost" onClick={()=>{const empty={keyword:"",type:"",startDate:"",endDate:""};setFilters(empty);setApplied(empty);setPage(1)}}>重置</Button></QueryCard>
  <Card>{list.isLoading?<LoadingState/>:list.error?<ErrorState error={list.error} retry={()=>list.refetch()}/>:!list.data?.list?.length?<EmptyState/>:<Table><TableHeader><TableRow><TableHead>日期</TableHead><TableHead>病案号</TableHead><TableHead>上架号</TableHead><TableHead>设备/批次</TableHead><TableHead>操作人</TableHead><TableHead>类型</TableHead><TableHead>页数</TableHead><TableHead>患者姓名</TableHead><TableHead>住院科室</TableHead><TableHead>出院日期</TableHead></TableRow></TableHeader><TableBody>{list.data.list.map((row,index)=><TableRow key={`${row.bah}-${row.sjh}-${index}`}><TableCell>{row.date||"—"}</TableCell><TableCell className="font-medium">{row.bah||"—"}</TableCell><TableCell>{row.sjh||"—"}</TableCell><TableCell>{row.cid||"—"}</TableCell><TableCell>{row.openerNo||"—"}</TableCell><TableCell>{row.type||"—"}</TableCell><TableCell>{row.pages??"—"}</TableCell><TableCell>{row.patientname||"—"}</TableCell><TableCell>{row.inpatientdepartment||"—"}</TableCell><TableCell>{row.dischargedate||"—"}</TableCell></TableRow>)}</TableBody></Table>}<Pager page={page} size={size} total={list.data?.total||0} onPageChange={setPage} onSizeChange={v=>{setSize(v);setPage(1)}}/></Card></>
}
