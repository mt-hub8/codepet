import type { AgentAdapterType } from "./agentAdapterTypes";

export type CommandTaskStatus =
  | "pending"
  | "running"
  | "succeeded"
  | "failed"
  | "cancelled"
  | "needs_user_input"
  | "no_output_timeout";

export type CommandEventType =
  | "started"
  | "stdout"
  | "stderr"
  | "succeeded"
  | "failed"
  | "cancelled"
  | "needs_user_input"
  | "no_output_timeout";

export type CommandTask = {
  id: string;
  title: string;
  adapterType: AgentAdapterType;
  workingDirectory: string;
  command: string;
  args?: string[];
  promptOrCommand?: string;
  executablePath?: string;
  status: CommandTaskStatus;
  exitCode?: number;
  noOutputTimeoutMinutes: number;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type CommandEvent = {
  id: string;
  taskId: string;
  eventType: CommandEventType;
  content?: string;
  createdAt: string;
};

export const commandTaskStatusLabels: Record<CommandTaskStatus, string> = {
  pending: "待运行",
  running: "运行中",
  succeeded: "已完成",
  failed: "失败",
  cancelled: "已取消",
  needs_user_input: "等待确认",
  no_output_timeout: "长时间无输出",
};

export const commandTaskStatusTagClass: Record<CommandTaskStatus, string> = {
  pending: "cp-tag-muted",
  running: "cp-tag-blue",
  succeeded: "cp-tag-green",
  failed: "cp-tag-danger",
  cancelled: "cp-tag-amber",
  needs_user_input: "cp-tag-amber",
  no_output_timeout: "cp-tag-danger",
};

export const ACTIVE_COMMAND_STATUSES: CommandTaskStatus[] = [
  "running",
  "needs_user_input",
  "no_output_timeout",
];
