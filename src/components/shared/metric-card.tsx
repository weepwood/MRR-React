import type { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { formatNumber } from "@/lib/utils"
export function MetricCard({ label, value, note, icon: Icon }: { label: string; value?: number | string | null; note?: string; icon?: LucideIcon }) {
  return <Card><CardContent className="flex items-start justify-between p-5"><div><p className="text-sm text-muted-foreground">{label}</p><p className="mt-2 text-2xl font-semibold tracking-tight">{typeof value === "number" ? formatNumber(value) : (value ?? "—")}</p>{note && <p className="mt-1 text-xs text-muted-foreground">{note}</p>}</div>{Icon && <div className="rounded-lg bg-muted p-2.5"><Icon className="size-5" /></div>}</CardContent></Card>
}
