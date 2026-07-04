import { createId, nowIso } from "../../reminders/reminderTime";
import { getAgentAdapter } from "./agentAdapters";
import type { AgentAdapterType } from "./agentAdapterTypes";
import { dependencyDetection } from "./dependencyDetection";
import { commandRunner } from "./commandRunner";
import { commandStorage } from "./commandStorage";
import { confirmDangerousCommand, isDangerousCommand } from "./commandSafety";
import type { CommandEvent, CommandTask, CommandTaskStatus } from "./commandTypes";

export type CreateCommandTaskInput = {
  title: string;
  adapterType: AgentAdapterType;
  workingDirectory: string;
  command?: string;
  argsText?: string;
  promptOrCommand?: string;
  executablePath?: string;
  noOutputTimeoutMinutes?: number;
};

function parseArgs(argsText?: string): string[] | undefined {
  const trimmed = argsText?.trim();
  if (!trimmed) {
    return undefined;
  }
  return trimmed.split(/\s+/);
}

async function resolveExecutablePath(
  adapterType: AgentAdapterType,
  explicit?: string,
): Promise<string | undefined> {
  if (explicit?.trim()) {
    return explicit.trim();
  }
  const paths = await dependencyDetection.loadCustomPaths();
  if (adapterType === "codex") {
    return paths.codex;
  }
  if (adapterType === "cursor") {
    return paths.cursor;
  }
  if (adapterType === "claude_code") {
    return paths.claude_code;
  }
  return undefined;
}

async function buildTaskFromInput(
  input: CreateCommandTaskInput,
  existing?: CommandTask,
): Promise<CommandTask> {
  const adapter = getAgentAdapter(input.adapterType);
  const extraArgs = parseArgs(input.argsText);
  const executablePath = await resolveExecutablePath(input.adapterType, input.executablePath);
  const built = adapter.buildCommand({
    workingDirectory: input.workingDirectory.trim(),
    promptOrCommand: input.promptOrCommand?.trim() ?? input.command?.trim() ?? "",
    command: input.command?.trim(),
    args: extraArgs,
    extraArgs,
    executablePath,
  });

  const now = nowIso();
  return {
    id: existing?.id ?? createId("cmd-task"),
    title: input.title.trim(),
    adapterType: input.adapterType,
    workingDirectory: built.workingDirectory,
    command: built.command,
    args: built.args.length > 0 ? built.args : undefined,
    promptOrCommand: input.promptOrCommand?.trim() || undefined,
    executablePath: executablePath || undefined,
    status: existing?.status ?? "pending",
    exitCode: existing?.exitCode,
    noOutputTimeoutMinutes: input.noOutputTimeoutMinutes ?? existing?.noOutputTimeoutMinutes ?? 5,
    startedAt: existing?.startedAt,
    completedAt: existing?.completedAt,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
}

export const commandService = {
  listTasks: () => commandStorage.listTasks(),

  listEvents: (taskId: string) => commandStorage.listEvents(taskId),

  async pickWorkingDirectory(): Promise<string | null> {
    const { open } = await import("@tauri-apps/plugin-dialog");
    const selected = await open({ directory: true, multiple: false });
    if (!selected || Array.isArray(selected)) {
      return null;
    }
    return selected;
  },

  async createTask(input: CreateCommandTaskInput): Promise<CommandTask> {
    const task = await buildTaskFromInput(input);
    if (!task.title || !task.workingDirectory || !task.command) {
      throw new Error("请填写任务标题、工作目录和执行命令或 prompt。");
    }
    await commandStorage.saveTask(task);
    return task;
  },

  async updateTask(task: CommandTask): Promise<CommandTask> {
    const updated: CommandTask = { ...task, updatedAt: nowIso() };
    await commandStorage.saveTask(updated);
    return updated;
  },

  async updateTaskFromInput(input: CreateCommandTaskInput, existing: CommandTask): Promise<CommandTask> {
    const task = await buildTaskFromInput(input, existing);
    await commandStorage.saveTask(task);
    return task;
  },

  async deleteTask(task: CommandTask): Promise<void> {
    await commandStorage.deleteTask(task.id);
  },

  async resetTaskForRerun(task: CommandTask): Promise<CommandTask> {
    const reset: CommandTask = {
      ...task,
      status: "pending",
      exitCode: undefined,
      startedAt: undefined,
      completedAt: undefined,
      updatedAt: nowIso(),
    };
    await commandStorage.saveTask(reset);
    return reset;
  },

  async updateTaskStatus(taskId: string, status: CommandTaskStatus, content?: string): Promise<CommandTask> {
    return commandStorage.updateTaskStatus(taskId, status, content);
  },

  async addTaskEvent(
    taskId: string,
    eventType: CommandEvent["eventType"],
    content?: string,
  ): Promise<void> {
    await commandStorage.addEvent({
      id: createId("cmd-event"),
      taskId,
      eventType,
      content,
      createdAt: nowIso(),
    });
  },

  async startTask(task: CommandTask): Promise<void> {
    if (task.status === "running") {
      throw new Error("该任务正在运行中。");
    }

    const args = task.args ?? [];
    let acknowledgeDangerous = false;
    if (isDangerousCommand(task.command, args)) {
      if (!confirmDangerousCommand(task.command, args)) {
        throw new Error("已取消启动高风险命令。");
      }
      acknowledgeDangerous = true;
    }

    const label = `${task.command} ${args.join(" ")}`.trim();
    if (!window.confirm(`确定要启动命令任务“${task.title}”吗？\n\n${label}`)) {
      throw new Error("已取消启动命令。");
    }

    await commandRunner.start(task.id, acknowledgeDangerous);
  },

  cancelTask: (taskId: string) => commandRunner.cancel(taskId),

  getRecentTasks(tasks: CommandTask[], limit = 3): CommandTask[] {
    return [...tasks]
      .sort((left, right) => {
        const leftTime = left.completedAt ?? left.startedAt ?? left.updatedAt;
        const rightTime = right.completedAt ?? right.startedAt ?? right.updatedAt;
        return rightTime.localeCompare(leftTime);
      })
      .slice(0, limit);
  },

  formatTaskTime(task: CommandTask): string {
    const value = task.completedAt ?? task.startedAt ?? task.updatedAt;
    const numeric = Number(value);
    const date = /^\d+$/.test(value) && !Number.isNaN(numeric)
      ? new Date(numeric)
      : new Date(value);
    return date.toLocaleString("zh-CN", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  },

  filterLogEvents(events: CommandEvent[]): CommandEvent[] {
    return events.filter((event) => event.eventType === "stdout" || event.eventType === "stderr");
  },

  isActiveStatus(status: CommandTaskStatus): boolean {
    return status === "running" || status === "needs_user_input" || status === "no_output_timeout";
  },
};
