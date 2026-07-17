import type { ReactNode } from "react"
export function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description?: string; actions?: ReactNode }) {
  return <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
    <div className="space-y-1"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{eyebrow}</p><h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>{description && <p className="max-w-3xl text-sm text-muted-foreground">{description}</p>}</div>
    {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
  </div>
}
