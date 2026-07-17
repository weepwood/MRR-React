import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Copy, Eye, EyeOff, RefreshCw, Search } from "lucide-react"
import { toast } from "sonner"
import { patientsApi } from "@/api/mrr"
import { EmptyState, ErrorState, LoadingState } from "@/components/shared/data-state"
import { PageHeader } from "@/components/shared/page-header"
import { Pager } from "@/components/shared/pager"
import { QueryCard, QueryField } from "@/components/shared/query-card"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDateTime } from "@/lib/utils"
function mask(value?: string) { if (!value) return "—"; return value.length > 7 ? `${value.slice(0,3)}${"*".repeat(value.length-7)}${value.slice(-4)}` : value }
export function PatientsPage() {
  const [page,setPage]=useState(1), [size,setSize]=useState(20), [keyword,setKeyword]=useState(""), [applied,setApplied]=useState("")
  const [revealed,setRevealed]=useState<Set<string>>(new Set())
  const query=useQuery({queryKey:["patients",page,size,applied],queryFn:()=>patientsApi.list({page,size,keyword:applied||undefined})})
  const rows=query.data?.list||[]
  return <><PageHeader eyebrow="Patient Management" title="患者管理" description="按病案号、姓名、身份证号、科室、病区和床位搜索患者基本信息。" actions={<Button variant="outline" onClick={()=>query.refetch()}><RefreshCw/>刷新</Button>} />
  <QueryCard><QueryField label="关键字" className="min-w-64 flex-1"><Input placeholder="病案号 / 姓名 / 身份证 / 科室" value={keyword} onChange={e=>setKeyword(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){setApplied(keyword);setPage(1)}}}/></QueryField><Button onClick={()=>{setApplied(keyword);setPage(1)}}><Search/>查询</Button><Button variant="ghost" onClick={()=>{setKeyword("");setApplied("");setPage(1)}}>重置</Button></QueryCard>
  <Card>{query.isLoading?<LoadingState/>:query.error?<ErrorState error={query.error} retry={()=>query.refetch()}/>:!rows.length?<EmptyState/>:<Table><TableHeader><TableRow><TableHead>病案号</TableHead><TableHead>姓名</TableHead><TableHead>身份证号</TableHead><TableHead>入院日期</TableHead><TableHead>入院时间</TableHead><TableHead>科室</TableHead><TableHead>病区</TableHead><TableHead>床位</TableHead></TableRow></TableHeader><TableBody>{rows.map((row,index)=>{const id=row.idCard||"";const show=revealed.has(id);return <TableRow key={row.id||index}><TableCell className="font-medium">{row.bah||"—"}</TableCell><TableCell>{row.name||"—"}</TableCell><TableCell><div className="flex items-center gap-1 font-mono text-xs"><span>{show?id:mask(id)}</span>{id&&<><Button variant="ghost" size="icon" className="size-7" onClick={()=>setRevealed(prev=>{const next=new Set(prev);next.has(id)?next.delete(id):next.add(id);return next})}>{show?<EyeOff/>:<Eye/>}</Button><Button variant="ghost" size="icon" className="size-7" onClick={()=>navigator.clipboard.writeText(id).then(()=>toast.success("身份证号已复制"))}><Copy/></Button></>}</div></TableCell><TableCell>{row.ruyuan||"—"}</TableCell><TableCell>{formatDateTime(row.admissiontime||row.admissionTime)}</TableCell><TableCell>{row.department||"—"}</TableCell><TableCell>{row.bingqu||"—"}</TableCell><TableCell>{row.chuangwei||"—"}</TableCell></TableRow>})}</TableBody></Table>}<Pager page={page} size={size} total={query.data?.total||0} onPageChange={setPage} onSizeChange={v=>{setSize(v);setPage(1)}}/></Card></>
}
