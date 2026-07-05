import { invoke } from "@tauri-apps/api/core";

export type DiagnosticInfo = {
  appVersion: string;
  osName: string;
  dataDir: string;
  databasePath: string;
  soundsDir: string;
  petsDir: string;
  logsDir: string;
};

export type SanitizedDiagnosticReport = {
  appVersion: string;
  osName: string;
  dataDir: string;
  logsDir: string;
  ollamaBaseUrl: string;
  selectedModel?: string;
  currentPetId?: string;
  lastDependencyScanAt?: string;
  lastErrorSummary?: string;
  aiEnabled: boolean;
};

function sanitizePath(path: string): string {
  return path
    .replace(/\\Users\\[^\\]+/gi, "\\Users\\<user>")
    .replace(/\/Users\/[^/]+/gi, "/Users/<user>")
    .replace(/\\Users\\[^\\]+/gi, "\\Users\\<user>");
}

export const diagnosticsService = {
  getInfo: () => invoke<DiagnosticInfo>("get_diagnostic_info"),

  openPath: (path: string) => invoke<void>("open_path_in_explorer", { path }),

  buildSanitizedReport(input: SanitizedDiagnosticReport): string {
    const lines = [
      "CodePet 诊断信息（已脱敏）",
      `应用版本: ${input.appVersion}`,
      `操作系统: ${input.osName}`,
      `数据目录: ${sanitizePath(input.dataDir)}`,
      `日志目录: ${sanitizePath(input.logsDir)}`,
      `Ollama 地址: ${input.ollamaBaseUrl}`,
      `默认模型: ${input.selectedModel ?? "未设置"}`,
      `本地 AI 启用: ${input.aiEnabled ? "是" : "否"}`,
      `当前桌宠: ${input.currentPetId ?? "默认"}`,
      `最近依赖检测: ${input.lastDependencyScanAt ?? "未检测"}`,
    ];
    if (input.lastErrorSummary) {
      lines.push(`最近错误摘要: ${input.lastErrorSummary}`);
    }
    lines.push("说明: 不包含命令日志、聊天记录、提醒内容或完整文件路径。");
    return lines.join("\n");
  },

  sanitizePath,
};
