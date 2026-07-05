export type DependencyStatus = "detected" | "not_detected" | "not_configured" | "failed";

export type DependencyItemId =
  | "git"
  | "node"
  | "pnpm"
  | "ollama"
  | "codex"
  | "cursor"
  | "claude_code";

export type DependencyItem = {
  id: DependencyItemId;
  name: string;
  detectCommand: string;
  detectArgs: string[];
  status: DependencyStatus;
  version?: string;
  customPath?: string;
  message?: string;
};

export type DependencyDetectionResult = {
  detected: boolean;
  version?: string;
  errorMessage?: string;
};

export const AGENT_TOOL_SETTING_KEYS = {
  codexExecutablePath: "codex_executable_path",
  cursorExecutablePath: "cursor_executable_path",
  claudeCodeExecutablePath: "claude_code_executable_path",
  needsUserInputKeywords: "needs_user_input_keywords",
} as const;
