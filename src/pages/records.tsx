import { useMemo, useState } from "react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { Download, RefreshCw, Search } from "lucide-react"
import { toast } from "sonner"
import { recordsApi } from "@/api/mrr"
import { EmptyState, ErrorState, LoadingState } from "@/components/shared/data-state"
import { PageHeader } from "@/components/shared/page-header"
import { Pager } from "@/components/shared/pager"
import { QueryCard, QueryField } from "@/components/shared/query-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { downloadBlob, formatDateTime } from "@/lib/utils"
import type { ScanRecord } from "@/types/api"

const typeNames: Record<number, string> = { 0:"00-暂未分类",1:"01-病案首页",2:"02-病程录",3:"03-手术记录",4:"04-术后病程录",5:"05-护理记录",6:"06-会诊单",7:"07-特殊检查",8:"08-检验单",9:"09-医嘱",10:"10-体温单",11:"11-新生儿",12:"12-出院记录",13:"13-大病史",14:"14-其它",15:"15-分娩记录" }
export function RecordsPage() {
  const [page, setPage] = useState(1), [size, setSize] = useState(20)
  const [filters, setFilters] = useState({ bah:"", brxh:"", sjh:"", openerNo:"", btype:"" })
  const [applied, setApplied] = useState(filters)
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const hasFilters = Object.values(applied).some(Boolean)
  const query = useQuery({ queryKey:["records", page, size, applied], queryFn:() => hasFilters ? recordsApi.search({ bah: applied.bah || undefined, brxh: applied.brxh || undefined, sjh: applied.sjh || undefined, openerNo: applied.openerNo || undefined, btype: applied.btype ? Number(applied.btype) : undefined }, page, size) : recordsApi.list({ page, size }) })
  const download = useMutation({ mutationFn: recordsApi.batchDownload, onSuccess:(blob) => downloadBlob(blob, `scan-batch-${Date.now()}.zip`), onError:(e) => toast.error(e.message) })
  const rows = query.data?.list || []
  const allSelected = rows.length > 0 && rows.every(r => r.id && selected.has(r.id))
  const selectedRows = useMemo(() => rows.filter(r => r.id && selected.has(r.id)), [rows, selected])
  function toggle(row: ScanRecord) { if (!row.id) return; setSelected(prev => { const next = new Set(prev); next.has(row.id!) ? next.delete(row.id!) : next.add(row.id!); return next }) }
  return <>
    <PageHeader eyebrow="Scan Records" title="记录管理" description="按病案号、病人序号、上架号、操作人和病案类型检索扫描记录。" actions={<><Button variant="outline" onClick={() => query.refetch()}><RefreshCw />刷新</Button><Button disabled={!selectedRows.length || download.isPending} onClick={() => download.mutate(selectedRows.map(r => r.id!))}><Download />批量下载（{selectedRows.length}）</Button></>} />
    <QueryCard>{(["bah","brxh","sjh","openerNo"] as const).map(key => <QueryField key={key} label={{bah:"病案号",brxh:"病人序号",sjh:"上架号",openerNo:"操作人"}[key]}><Input value={filters[key]} onChange={e => setFilters({...filters,[key]:e.target.value})} /></QueryField>)}<QueryField label="病案类型"><select className="h-9 w-full rounded-md border bg-background px-3 text-sm" value={filters.btype} onChange={e => setFilters({...filters,btype:e.target.value})}><option value="">全部类型</option>{Object.entries(typeNames).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></QueryField><Button onClick={() => { setPage(1); setApplied(filters) }}><Search />查询</Button><Button variant="ghost" onClick={() => { const empty={bah:"",brxh:"",sjh:"",openerNo:"",btype:""}; setFilters(empty); setApplied(empty); setPage(1) }}>重置</Button></QueryCard>
    <Card>{query.isLoading ? <LoadingState /> : query.error ? <ErrorState error={query.error} retry={() => query.refetch()} /> : !rows.length ? <EmptyState /> : <Table><TableHeader><TableRow><TableHead className="w-10"><Checkbox checked={allSelected} onCheckedChange={() => setSelected(allSelected ? new Set() : new Set(rows.flatMap(r => r.id ? [r.id] : [])))} /></TableHead><TableHead>ID</TableHead><TableHead>病案号</TableHead><TableHead>上架号</TableHead><TableHead>病人序号</TableHead><TableHead>文件名</TableHead><TableHead>类型</TableHead><TableHead>页码</TableHead><TableHead>迁移状态</TableHead><TableHead>上传时间</TableHead></TableRow></TableHeader><TableBody>{rows.map((row, index) => <TableRow key={row.id || index}><TableCell><Checkbox checked={!!row.id && selected.has(row.id)} onCheckedChange={() => toggle(row)} /></TableCell><TableCell>{row.id}</TableCell><TableCell className="font-medium">{row.bah || "—"}</TableCell><TableCell>{row.sjh || "—"}</TableCell><TableCell>{row.brxh || "—"}</TableCell><TableCell className="max-w-64 truncate" title={row.filename}>{row.filename || "—"}</TableCell><TableCell>{typeNames[Number(row.btype)] || row.btype || "—"}</TableCell><TableCell>{row.pages ?? "—"}</TableCell><TableCell><Badge variant={row.migrationStatus === "migrated" || row.migrationStatus === "verified" ? "success" : "secondary"}>{row.migrationStatus || "未迁移"}</Badge></TableCell><TableCell>{formatDateTime(row.uploadDate)}</TableCell></TableRow>)}</TableBody></Table>}<Pager page={page} size={size} total={query.data?.total || 0} onPageChange={setPage} onSizeChange={(next) => { setSize(next); setPage(1) }} /></Card>
  </>
}
