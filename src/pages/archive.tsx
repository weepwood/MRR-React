import { useEffect, useMemo, useRef, useState } from "react"
import { useMutation, useQuery } from "@tanstack/react-query"
import JSZip from "jszip"
import { Download, Grid2X2, Images, List, RefreshCw, Search, UserRoundSearch } from "lucide-react"
import { useSearchParams } from "react-router-dom"
import { toast } from "sonner"
import { imageApi } from "@/api/mrr"
import { EmptyState, ErrorState, LoadingState } from "@/components/shared/data-state"
import { PageHeader } from "@/components/shared/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { cn, downloadBlob } from "@/lib/utils"
import type { IdCardArchiveCase, PatientRecord, ScanRecord } from "@/types/api"

const typeNames: Record<number, string> = {
  0: "暂未分类", 1: "病案首页", 2: "病程录", 3: "手术记录", 4: "术后病程录",
  5: "护理记录", 6: "会诊单", 7: "特殊检查", 8: "检验单", 9: "医嘱",
  10: "体温单", 11: "新生儿", 12: "出院记录", 13: "大病史", 14: "其它", 15: "分娩记录",
}

function imageUrl(image: ScanRecord) {
  return image.img_url || image.ossUrl || (image.id ? `/api/v1/img/oss-image/${image.id}` : "")
}

export function ArchivePage() {
  const [params, setParams] = useSearchParams()
  const [bah, setBah] = useState(params.get("bah") || "")
  const [sjh, setSjh] = useState(params.get("sjh") || "")
  const [idCard, setIdCard] = useState(params.get("idcard") || "")
  const [userid, setUserid] = useState(params.get("userid") || "")
  const [selectedType, setSelectedType] = useState("all")
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [current, setCurrent] = useState(0)
  const [view, setView] = useState<"grid" | "list">("grid")
  const [cases, setCases] = useState<IdCardArchiveCase[]>([])
  const [patient, setPatient] = useState<PatientRecord | null>(null)
  const autoIdCard = useRef("")

  const queryBah = params.get("bah") || ""
  const querySjh = params.get("sjh") || ""
  const token = params.get("id") || ""

  const images = useQuery({
    queryKey: ["archive-images", queryBah, querySjh, userid],
    queryFn: () => imageApi.search({ bah: queryBah || undefined, sjh: querySjh || undefined, userid: userid || undefined }),
    enabled: Boolean(queryBah || querySjh),
  })
  const tokenQuery = useQuery({
    queryKey: ["archive-token", token],
    queryFn: () => imageApi.archiveCasesByToken(token),
    enabled: Boolean(token),
  })

  useEffect(() => {
    if (tokenQuery.data) setCases(tokenQuery.data.cases || [])
  }, [tokenQuery.data])

  useEffect(() => {
    const first = images.data?.[0]
    if (!first?.bah) return
    imageApi.patient(first.bah).then(setPatient).catch(() => setPatient(null))
  }, [images.data])

  const filtered = useMemo(
    () => selectedType === "all" ? (images.data || []) : (images.data || []).filter((item) => Number(item.btype) === Number(selectedType)),
    [images.data, selectedType],
  )
  const currentImage = filtered[current]

  useEffect(() => setCurrent(0), [selectedType, queryBah, querySjh])

  const idSearch = useMutation({
    mutationFn: imageApi.archiveCasesByIdCard,
    onSuccess: (data) => {
      setCases(data.cases || [])
      if (data.token) {
        setParams((previous) => {
          const next = new URLSearchParams(previous)
          next.set("id", data.token)
          return next
        })
      }
      if (!data.cases?.length) toast.info("未查询到该患者的影像病案")
    },
    onError: (error) => toast.error(error.message),
  })

  useEffect(() => {
    const legacyIdCard = params.get("idcard")?.trim() || ""
    if (!legacyIdCard || token || autoIdCard.current === legacyIdCard) return
    autoIdCard.current = legacyIdCard
    setIdCard(legacyIdCard)
    idSearch.mutate(legacyIdCard)
  }, [params, token, idSearch])

  const typeMutation = useMutation({
    mutationFn: ({ id, btype }: { id: number; btype: number }) => imageApi.updateType(id, btype),
    onSuccess: () => {
      toast.success("影像类型已更新")
      images.refetch()
    },
    onError: (error) => toast.error(error.message),
  })

  function search() {
    const nextBah = bah.trim()
    const nextSjh = sjh.trim()
    if (!nextBah && !nextSjh) {
      toast.warning("请输入病案号或上架号")
      return
    }
    setParams((previous) => {
      const next = new URLSearchParams(previous)
      nextBah ? next.set("bah", nextBah) : next.delete("bah")
      nextSjh ? next.set("sjh", nextSjh) : next.delete("sjh")
      userid ? next.set("userid", userid) : next.delete("userid")
      next.delete("id")
      return next
    })
    setCases([])
    setSelected(new Set())
  }

  function chooseCase(item: IdCardArchiveCase) {
    setBah(item.bah || "")
    setSjh(item.sjh || "")
    setPatient(item)
    setParams((previous) => {
      const next = new URLSearchParams(previous)
      item.bah ? next.set("bah", item.bah) : next.delete("bah")
      item.sjh ? next.set("sjh", item.sjh) : next.delete("sjh")
      return next
    })
  }

  async function downloadSelected() {
    const source = (images.data || []).filter((item) => item.id && selected.has(item.id))
    if (!source.length) {
      toast.warning("请先选择影像")
      return
    }
    try {
      const zip = new JSZip()
      await Promise.all(source.map(async (item, index) => {
        const url = imageUrl(item)
        if (!url) return
        const response = await fetch(url, { credentials: "include" })
        if (!response.ok) throw new Error(`下载失败：${item.filename || item.id}`)
        zip.file(item.filename || `${String(index + 1).padStart(4, "0")}.jpg`, await response.blob())
      }))
      downloadBlob(await zip.generateAsync({ type: "blob" }), `${queryBah || "archive"}${querySjh ? `-${querySjh}` : ""}.zip`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "影像打包失败")
    }
  }

  const allFilteredSelected = filtered.length > 0 && filtered.every((item) => Boolean(item.id && selected.has(item.id)))

  return <>
    <PageHeader
      eyebrow="Image Archive"
      title="影像档案袋"
      description="支持病案号、上架号与身份证查询，进行影像预览、分类、选择和打包下载。"
      actions={<>
        <Button variant="outline" onClick={() => images.refetch()} disabled={!images.isFetched}><RefreshCw />刷新</Button>
        <Button onClick={downloadSelected} disabled={!selected.size}><Download />下载已选（{selected.size}）</Button>
      </>}
    />

    <Card>
      <CardContent className="grid gap-3 p-4 lg:grid-cols-[1fr_1fr_1fr_auto]">
        <label><span className="mb-1.5 block text-xs text-muted-foreground">病案号</span><Input value={bah} onChange={(event) => setBah(event.target.value)} onKeyDown={(event) => event.key === "Enter" && search()} /></label>
        <label><span className="mb-1.5 block text-xs text-muted-foreground">上架号</span><Input value={sjh} onChange={(event) => setSjh(event.target.value)} onKeyDown={(event) => event.key === "Enter" && search()} /></label>
        <label><span className="mb-1.5 block text-xs text-muted-foreground">调用方用户 ID</span><Input value={userid} onChange={(event) => setUserid(event.target.value)} placeholder="可选" /></label>
        <Button className="self-end" onClick={search}><Search />查询影像</Button>
      </CardContent>
      <div className="border-t p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input value={idCard} onChange={(event) => setIdCard(event.target.value)} placeholder="输入身份证号查询该患者全部病案" />
          <Button variant="outline" disabled={!idCard || idSearch.isPending} onClick={() => idSearch.mutate(idCard)}><UserRoundSearch />身份证查询</Button>
        </div>
        {cases.length > 0 && <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {cases.map((item, index) => <button key={`${item.bah}-${item.sjh}-${index}`} onClick={() => chooseCase(item)} className="min-w-56 rounded-lg border p-3 text-left hover:bg-muted">
            <p className="font-medium">{item.name || "未知患者"}</p>
            <p className="mt-1 text-xs text-muted-foreground">病案号 {item.bah || "—"} · 上架号 {item.sjh || "—"}</p>
            <p className="text-xs text-muted-foreground">{item.department || "—"} / {item.bingqu || "—"}</p>
          </button>)}
        </div>}
      </div>
    </Card>

    {(queryBah || querySjh) && <div className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)]">
      <div className="space-y-4">
        {patient && <Card><CardHeader><CardTitle className="text-base">患者信息</CardTitle></CardHeader><CardContent className="space-y-2 text-sm">
          <p className="text-lg font-semibold">{patient.name || "未知患者"}</p>
          <p>病案号：{patient.bah || queryBah || "—"}</p><p>科室：{patient.department || "—"}</p>
          <p>病区/床位：{patient.bingqu || "—"} / {patient.chuangwei || "—"}</p>
          <p>入院：{patient.ruyuan || patient.admissionTime || patient.admissiontime || "—"}</p>
        </CardContent></Card>}
        <Card><CardHeader><CardTitle className="text-base">影像类型</CardTitle></CardHeader><CardContent className="space-y-1">
          <button onClick={() => setSelectedType("all")} className={cn("flex w-full items-center justify-between rounded-md px-3 py-2 text-sm", selectedType === "all" ? "bg-primary text-primary-foreground" : "hover:bg-muted")}><span>全部影像</span><Badge variant="secondary">{images.data?.length || 0}</Badge></button>
          {Object.entries(typeNames).map(([value, label]) => {
            const count = (images.data || []).filter((item) => Number(item.btype) === Number(value)).length
            if (!count) return null
            return <button key={value} onClick={() => setSelectedType(value)} className={cn("flex w-full items-center justify-between rounded-md px-3 py-2 text-sm", selectedType === value ? "bg-primary text-primary-foreground" : "hover:bg-muted")}><span>{value.padStart(2, "0")}-{label}</span><Badge variant="secondary">{count}</Badge></button>
          })}
        </CardContent></Card>
      </div>

      <Card className="min-w-0 overflow-hidden">
        {images.isLoading ? <LoadingState /> : images.error ? <ErrorState error={images.error} retry={() => images.refetch()} /> : !filtered.length ? <EmptyState title="未查询到影像" /> : <>
          <div className="flex flex-wrap items-center justify-between gap-2 border-b p-3">
            <div className="flex items-center gap-2">
              <Checkbox checked={allFilteredSelected} onCheckedChange={() => {
                const ids = filtered.flatMap((item) => item.id ? [item.id] : [])
                setSelected((previous) => {
                  const next = new Set(previous)
                  ids.forEach((id) => allFilteredSelected ? next.delete(id) : next.add(id))
                  return next
                })
              }} />
              <span className="text-sm text-muted-foreground">{filtered.length} 张影像</span>
            </div>
            <div className="flex gap-1"><Button size="icon" variant={view === "grid" ? "secondary" : "ghost"} onClick={() => setView("grid")}><Grid2X2 /></Button><Button size="icon" variant={view === "list" ? "secondary" : "ghost"} onClick={() => setView("list")}><List /></Button></div>
          </div>
          <div className="grid min-h-[660px] lg:grid-cols-[minmax(0,1fr)_300px]">
            <div className="flex min-w-0 flex-col bg-black/95">
              <div className="grid min-h-[540px] flex-1 place-items-center overflow-auto p-4">{currentImage ? <img src={imageUrl(currentImage)} alt={currentImage.filename || "病案影像"} className="max-h-[75vh] max-w-full object-contain" /> : <Images className="size-16 text-white/30" />}</div>
              {currentImage && <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 bg-black/70 px-4 py-3 text-sm text-white"><span>{current + 1}/{filtered.length} · {currentImage.filename}</span><select className="h-8 rounded-md border-white/20 bg-black px-2 text-xs" value={Number(currentImage.btype || 0)} onChange={(event) => currentImage.id && typeMutation.mutate({ id: currentImage.id, btype: Number(event.target.value) })}>{Object.entries(typeNames).map(([value, label]) => <option key={value} value={value}>{value.padStart(2, "0")}-{label}</option>)}</select></div>}
            </div>
            <div className={cn("max-h-[760px] overflow-y-auto border-l p-3", view === "grid" ? "grid grid-cols-2 content-start gap-2" : "space-y-2")}>{filtered.map((image, index) => <button key={image.id || index} onClick={() => setCurrent(index)} className={cn("group relative overflow-hidden rounded-lg border text-left", current === index && "ring-2 ring-ring", view === "list" && "flex items-center gap-3 p-2")}>
              <img src={imageUrl(image)} loading="lazy" className={cn("bg-muted object-cover", view === "grid" ? "aspect-[3/4] w-full" : "size-16 shrink-0 rounded-md")} alt={image.filename} />
              <span className="absolute left-2 top-2" onClick={(event) => event.stopPropagation()}><Checkbox checked={Boolean(image.id && selected.has(image.id))} onCheckedChange={() => image.id && setSelected((previous) => { const next = new Set(previous); next.has(image.id!) ? next.delete(image.id!) : next.add(image.id!); return next })} /></span>
              <div className={cn("min-w-0", view === "grid" ? "p-2" : "flex-1")}><p className="truncate text-xs font-medium">{image.filename || `影像 ${index + 1}`}</p><p className="truncate text-[11px] text-muted-foreground">{typeNames[Number(image.btype)] || "暂未分类"}</p></div>
            </button>)}</div>
          </div>
        </>}
      </Card>
    </div>}
  </>
}
