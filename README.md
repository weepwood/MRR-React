# MRR React

MRR 病案文件管理系统的 React 前端重构版本。

本项目使用 React、TypeScript、Vite、React Router、TanStack Query/Table 与 shadcn/ui 组件组织方式，继续对接 `weepwood/MRR` 的 Spring Boot API。

## 功能范围

- 工作台
- 扫描记录管理
- 患者管理
- 病案扫描统计与明细
- 影像档案袋
- 档案装箱
- OSS 迁移管理
- 用户与权限管理
- 日志和图片访问审计
- 系统监控与公开状态页
- 接口响应分析
- 系统设置
- 帮助文档

## 本地运行

```bash
npm install
cp .env.example .env.local
npm run dev
```

默认开发地址：`http://localhost:5173`。

## 环境变量

```env
VITE_API_BASE_URL=/proxy/
VITE_PROXY_TARGET=http://127.0.0.1:8001
VITE_AUTH_ENABLED=false
```

- `VITE_API_BASE_URL`：生产环境 API 基础路径。
- `VITE_PROXY_TARGET`：Vite 开发代理目标。
- `VITE_AUTH_ENABLED`：是否启用前端登录守卫；与 MRR 当前 `dev-no-login` 分支保持一致，默认关闭。

## 构建

```bash
npm run build
npm run preview
```

构建产物位于 `dist/`。

## Windows + Nginx 部署

```bash
npm ci
npm run build
```

将 `dist/` 内容复制到 Nginx 站点目录，并参考 `deploy/nginx.conf.example` 配置 SPA 回退与 `/api/` 反向代理。

## 路由兼容

保留原前端主要路由，包括：

- `/records`
- `/patients`
- `/statistics`
- `/statistics-detail`
- `/archive`
- `/archive/embed`
- `/archive-boxes`
- `/oss-migration`
- `/users`
- `/permissions`
- `/logs`
- `/audit-images`
- `/monitoring`
- `/status`
- `/response-analysis`
- `/settings`
- `/help`

旧 `/idcard` 与 `/idcard/:idCard` 地址会重定向到新的影像档案袋。

## 设计系统

项目采用 shadcn/ui 的源码内组件模式，基础组件位于 `src/components/ui`，业务组件位于 `src/components/shared`。主题使用 CSS 变量管理，并支持浅色、深色和跟随系统。
