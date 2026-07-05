export type DoctorDependencyStatus =
  | "checking"
  | "available"
  | "missing"
  | "not_configured"
  | "error"
  | "skipped";

export type DoctorCategory = "basic" | "local_ai" | "agent" | "environment";

export type DoctorDependencyItem = {
  id: string;
  name: string;
  category: DoctorCategory;
  status: DoctorDependencyStatus;
  detectCommand: string;
  version?: string;
  customPath?: string;
  problem?: string;
  fixSuggestion?: string;
};

export type DoctorScanResult = {
  items: DoctorDependencyItem[];
  scannedAt: string;
};

export const doctorCategoryLabels: Record<DoctorCategory, string> = {
  basic: "基础依赖",
  local_ai: "本地 AI",
  agent: "Agent 工具",
  environment: "应用环境",
};

export const doctorStatusLabels: Record<DoctorDependencyStatus, string> = {
  checking: "检测中",
  available: "已检测到",
  missing: "未检测到",
  not_configured: "未配置",
  error: "检测失败",
  skipped: "已跳过",
};
