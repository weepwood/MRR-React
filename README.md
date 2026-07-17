# MRR React

MRR 病案文件管理系统的新 React 管理端。项目以 `weepwood/MRR` 的 `frontend-fantastic-admin` 为迁移基线，保留原有 Spring Boot API、主要页面 URL 和业务数据结构，前端技术栈完全改为 React。

## 技术栈

- React 19 + TypeScript
- Vite 7
- React Router 7
- TanStack Query / TanStack Table
- shadcn/ui 组件组织方式 + Radix UI
- Tailwind CSS 4
- Recharts
- Zustand
- Axios

## 已迁移页面

- 工作台
- 记录管理
- 患者管理
- 病案扫描统计 / 统计明细
- 影像档案袋（独立页与内嵌页）
- 档案装箱
- OSS 迁移管理
- 用户管理 / 权限管理
- 系统设置
- 日志管理 / 图片访问审计
- 系统监控 / 服务状态
- 接口响应分析
- 帮助与文档

## 本地开发

```bash
npm install
cp .env.example .env.local
npm run dev
```

开发环境默认将 `/proxy/*` 转发到 `http://127.0.0.1:8080`，可通过 `VITE_PROXY_TARGET` 修改。

## 生产构建

```bash
npm run build
```

构建产物位于 `dist/`。同域部署时 `VITE_APP_API_BASEURL` 留空；前后端分离时填入后端 API 地址。

## 认证模式

目标仓库默认对齐 `MRR/dev-no-login`：

```env
VITE_AUTH_ENABLED=false
```

需要启用路由登录保护时改为 `true`。登录、用户和权限接口仍然完整保留。

## Nginx

仓库提供 `deploy/nginx.conf.example`。重点是 SPA 回退：

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

后端接口可继续通过同域 `/api/` 反向代理。

## 迁移边界

本仓库只替换 `frontend-fantastic-admin`，不会修改 MRR 后端数据库结构和 API。部署切换前建议在测试环境依次验证：登录、扫描记录分页、影像搜索、批量下载、统计导出、装箱 CRUD、OSS 任务、用户权限和系统设置。
