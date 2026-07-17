import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Search, ShieldBan, UserCog } from "lucide-react"
import { toast } from "sonner"
import { authApi } from "@/api/mrr"
import { EmptyState, ErrorState, LoadingState } from "@/components/shared/data-state"
import { PageHeader } from "@/components/shared/page-header"
import { Pager } from "@/components/shared/pager"
import { QueryCard, QueryField } from "@/components/shared/query-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDateTime } from "@/lib/utils"
import type { AuthUser } from "@/types/api"
export function UsersPage(){
 const qc=useQueryClient(),[page,setPage]=useState(1),[size,setSize]=useState(20),[keyword,setKeyword]=useState(""),[applied,setApplied]=useState(""),[current,setCurrent]=useState<AuthUser|null>(null),[form,setForm]=useState({displayName:"",roleCode:"",status:"ACTIVE"})
 const users=useQuery({queryKey:["users",page,size,applied],queryFn:()=>authApi.users({page,size,keyword:applied||undefined})}),roles=useQuery({queryKey:["roles"],queryFn:authApi.roles})
 const save=useMutation({mutationFn:()=>authApi.updateUser(current!.id!,form),onSuccess:()=>{toast.success("用户已更新");setCurrent(null);qc.invalidateQueries({queryKey:["users"]})},onError:e=>toast.error(e.message)})
 const disable=useMutation({mutationFn:authApi.disableUser,onSuccess:()=>{toast.success("用户已禁用");qc.invalidateQueries({queryKey:["users"]})},onError:e=>toast.error(e.message)})
 function edit(user:AuthUser){setCurrent(user);setForm({displayName:user.displayName||"",roleCode:user.roleCode||"",status:user.status||"ACTIVE"})}
 return <><PageHeader eyebrow="Users" title="用户管理" description="维护用户显示名称、角色与启用状态。"/><QueryCard><QueryField label="关键字"><Input value={keyword} onChange={e=>setKeyword(e.target.value)} placeholder="用户名 / 显示名称"/></QueryField><Button onClick={()=>{setApplied(keyword);setPage(1)}}><Search/>查询</Button></QueryCard><Card>{users.isLoading?<LoadingState/>:users.error?<ErrorState error={users.error}/>:!users.data?.list.length?<EmptyState/>:<Table><TableHeader><TableRow><TableHead>用户名</TableHead><TableHead>显示名称</TableHead><TableHead>角色</TableHead><TableHead>状态</TableHead><TableHead>最后登录</TableHead><TableHead>权限数</TableHead><TableHead className="w-28">操作</TableHead></TableRow></TableHeader><TableBody>{users.data.list.map(user=><TableRow key={user.id}><TableCell className="font-medium">{user.username}</TableCell><TableCell>{user.displayName||"—"}</TableCell><TableCell>{user.roleName||user.roleCode||"—"}</TableCell><TableCell><Badge variant={user.status==="ACTIVE"?"success":"secondary"}>{user.status||"UNKNOWN"}</Badge></TableCell><TableCell>{formatDateTime(user.lastLoginAt)}</TableCell><TableCell>{user.permissions?.length||0}</TableCell><TableCell><Button variant="ghost" size="icon" onClick={()=>edit(user)}><UserCog/></Button><Button variant="ghost" size="icon" disabled={user.status!=="ACTIVE"} onClick={()=>user.id&&confirm("确认禁用该用户？")&&disable.mutate(user.id)}><ShieldBan/></Button></TableCell></TableRow>)}</TableBody></Table>}<Pager page={page} size={size} total={users.data?.total||0} onPageChange={setPage} onSizeChange={v=>{setSize(v);setPage(1)}}/></Card><Dialog open={!!current} onOpenChange={open=>!open&&setCurrent(null)}><DialogContent><DialogHeader><DialogTitle>编辑用户</DialogTitle><DialogDescription>{current?.username}</DialogDescription></DialogHeader><div className="space-y-4"><div className="space-y-2"><Label>显示名称</Label><Input value={form.displayName} onChange={e=>setForm({...form,displayName:e.target.value})}/></div><div className="space-y-2"><Label>角色</Label><select className="h-9 w-full rounded-md border bg-background px-3 text-sm" value={form.roleCode} onChange={e=>setForm({...form,roleCode:e.target.value})}>{roles.data?.map(role=><option key={role.code} value={role.code}>{role.name||role.code}</option>)}</select></div><div className="space-y-2"><Label>状态</Label><select className="h-9 w-full rounded-md border bg-background px-3 text-sm" value={form.status} onChange={e=>setForm({...form,status:e.target.value})}><option value="ACTIVE">ACTIVE</option><option value="DISABLED">DISABLED</option><option value="LOCKED">LOCKED</option></select></div></div><DialogFooter><Button variant="outline" onClick={()=>setCurrent(null)}>取消</Button><Button disabled={save.isPending||!form.roleCode} onClick={()=>save.mutate()}>保存</Button></DialogFooter></DialogContent></Dialog></>
}
