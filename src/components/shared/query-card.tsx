import type { ReactNode } from "react"
import { Card, CardContent } from "@/components/ui/card"
export function QueryCard({ children }: { children: ReactNode }) { return <Card><CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:flex-wrap sm:items-end">{children}</CardContent></Card> }
export function QueryField({ label, children, className = "min-w-44 flex-1" }: { label: string; children: ReactNode; className?: string }) { return <label className={className}><span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</span>{children}</label> }
