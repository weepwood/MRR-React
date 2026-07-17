import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
export function NotFoundPage(){return <div className="grid min-h-[60vh] place-items-center text-center"><div><p className="text-7xl font-bold tracking-tight">404</p><h1 className="mt-4 text-2xl font-semibold">页面不存在</h1><p className="mt-2 text-sm text-muted-foreground">请求的页面可能已移动或被删除。</p><Button asChild className="mt-6"><Link to="/">返回主页</Link></Button></div></div>}
