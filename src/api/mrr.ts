import { blob, del, get, post, postBlob, put } from "@/lib/api"
import type { ArchiveBoxGroup, ArchiveBoxRecord, ArchiveBoxStatus, ArchiveBoxSummary, AuthRole, AuthUser, DashboardData, DateStatistics, HealthInfo, IdCardArchiveSearchResponse, ImageAuditAnalytics, LogRecord, MigrationLogRecord, MigrationStatistics, PaginatedResult, PatientRecord, ResponseMetricAnalysis, ScanRecord, StatisticsRecord, StatisticsSummary, SystemOverview } from "@/types/api"

export const authApi = {
  login: (account: string, password: string) => post<any>("/api/v1/auth/login", { username: account, password }),
  me: () => get<AuthUser>("/api/v1/auth/me"),
  logout: () => post<void>("/api/v1/auth/logout"),
  users: (params: Record<string, unknown>) => get<PaginatedResult<AuthUser>>("/api/v1/auth/users", { params }),
  roles: () => get<AuthRole[]>("/api/v1/auth/roles"),
  updateUser: (id: number, data: { displayName?: string; roleCode: string; status: string }) => put<AuthUser>(`/api/v1/auth/users/${id}`, data),
  disableUser: (id: number) => del<void>(`/api/v1/auth/users/${id}`),
  updateRole: (code: string, data: Partial<AuthRole>) => put<AuthRole>(`/api/v1/auth/roles/${code}`, data),
}
export const recordsApi = {
  list: (params: { page: number; size: number }) => get<PaginatedResult<ScanRecord>>("/api/v1/scan/page", { params }),
  search: (data: Partial<ScanRecord>, page: number, size: number) => post<PaginatedResult<ScanRecord>>("/api/v1/scan/page/condition", data, { params: { page, size } }),
  batchDownload: (ids: number[]) => postBlob("/api/v1/scan/batch-download", { ids }),
}
export const patientsApi = { list: (params: Record<string, unknown>) => get<PaginatedResult<PatientRecord>>("/api/v1/patients", { params }) }
export const statisticsApi = {
  list: (params: Record<string, unknown>) => get<PaginatedResult<StatisticsRecord>>("/api/v1/statistics", { params }),
  summary: () => get<StatisticsSummary>("/api/v1/statistics/summary"),
  dates: () => get<DateStatistics[]>("/api/v1/statistics/date-summary"),
  dashboard: () => get<DashboardData>("/api/v1/statistics/dashboard"),
  exportCsv: (params: Record<string, unknown>) => blob("/api/v1/statistics/export/csv", { params }),
  departments: () => get<string[]>("/api/v1/statistics/departments"),
}
export const imageApi = {
  search: (params: Record<string, unknown>) => get<ScanRecord[]>("/api/v1/img/search", { params }),
  updateType: (id: number, btype: number) => put<void>(`/api/v1/img/updateImageType/${id}`, { btype }),
  archiveCasesByIdCard: (idCard: string) => post<IdCardArchiveSearchResponse>("/api/v1/search/archive-cases", { idCard }),
  archiveCasesByToken: (id: string) => get<IdCardArchiveSearchResponse>("/api/v1/search/archive-cases", { params: { id } }),
  patient: (bah: string) => get<PatientRecord>(`/api/v1/search/patient/${bah}`),
}
export const archiveBoxesApi = {
  list: (params: Record<string, unknown>) => get<PaginatedResult<ArchiveBoxRecord>>("/api/v1/archive-box-records", { params }),
  groups: (params: Record<string, unknown>) => get<PaginatedResult<ArchiveBoxGroup>>("/api/v1/archive-box-records/boxes", { params }),
  summary: () => get<ArchiveBoxSummary>("/api/v1/archive-box-records/summary"),
  create: (data: Partial<ArchiveBoxRecord> & { status: ArchiveBoxStatus }) => post<ArchiveBoxRecord>("/api/v1/archive-box-records", data),
  update: (id: number, data: Partial<ArchiveBoxRecord> & { status: ArchiveBoxStatus }) => put<ArchiveBoxRecord>(`/api/v1/archive-box-records/${id}`, data),
  remove: (id: number) => del<string>(`/api/v1/archive-box-records/${id}`),
}
export const logsApi = {
  system: (params: Record<string, unknown>) => get<PaginatedResult<LogRecord>>("/api/v1/logs/search", { params }),
  images: (params: Record<string, unknown>) => get<PaginatedResult<LogRecord>>("/api/v1/logs/audit/images", { params }),
  analytics: (params: Record<string, unknown>) => get<ImageAuditAnalytics>("/api/v1/logs/audit/images/analytics", { params }),
  cleanup: (params: Record<string, unknown> = {}) => post<void>("/api/v1/logs/retention/cleanup", null, { params }),
  exportRetention: () => blob("/api/v1/logs/retention/export"),
}
export const systemApi = {
  health: () => get<HealthInfo>("/api/v1/system/health"),
  overview: () => get<SystemOverview>("/api/v1/system/overview"),
  settings: () => get<Record<string, string>>("/api/v1/settings"),
  saveSettings: (settings: Record<string, string>) => put<void>("/api/v1/settings", settings),
  responseAnalysis: (days = 365) => get<ResponseMetricAnalysis>("/api/v1/response-metrics/analysis", { params: { days } }),
}
export const ossApi = {
  statistics: () => get<MigrationStatistics>("/api/v1/oss/migration/statistics"),
  pending: (params: Record<string, unknown>) => get<{ list: ScanRecord[]; total: number }>("/api/v1/oss/migration/pending", { params }),
  folders: () => get<Array<{ folder: string; cnt: number }>>("/api/v1/oss/migration/pending-folders"),
  logs: (params: Record<string, unknown>) => get<PaginatedResult<MigrationLogRecord>>("/api/v1/oss/migration/logs", { params }),
  upload: (scanIds: number[]) => post<any>("/api/v1/oss/upload", { scanIds }),
  uploadByBah: (bah: string) => post<any>(`/api/v1/oss/upload/bah/${encodeURIComponent(bah)}`),
  uploadByFolder: (folder: string) => post<any>(`/api/v1/oss/upload/folder/${encodeURIComponent(folder)}`),
}
