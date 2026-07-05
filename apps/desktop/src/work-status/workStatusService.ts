import type { CommandTask } from "../integrations/command/commandTypes";
import type { Reminder, ReminderEvent } from "../reminders/reminderTypes";
import { petStateLabels, type PetState } from "../pet/petState";

export type WorkEventItem = {
  id: string;
  category: "reminder" | "command" | "ai" | "pet";
  title: string;
  detail?: string;
  createdAt: string;
};

export type WorkStatusOverview = {
  completedReminders: number;
  ignoredReminders: number;
  commandTasksRun: number;
  failedTasks: number;
  waitingConfirmCount: number;
  localAiEnabled: boolean;
  currentPetName?: string;
  currentPetState?: string;
};

function isToday(iso: string): boolean {
  const date = new Date(iso);
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

export function buildWorkOverview(input: {
  reminderEvents: ReminderEvent[];
  commandTasks: CommandTask[];
  localAiEnabled: boolean;
  currentPetName?: string;
  currentPetState?: PetState;
}): WorkStatusOverview {
  const todayReminderEvents = input.reminderEvents.filter((event) => isToday(event.createdAt));
  const todayTasks = input.commandTasks.filter(
    (task) => task.startedAt && isToday(task.startedAt),
  );

  return {
    completedReminders: todayReminderEvents.filter((event) => event.eventType === "completed").length,
    ignoredReminders: todayReminderEvents.filter((event) =>
      ["ignored", "snoozed"].includes(event.eventType),
    ).length,
    commandTasksRun: todayTasks.length,
    failedTasks: todayTasks.filter((task) => task.status === "failed").length,
    waitingConfirmCount: todayTasks.filter((task) => task.status === "needs_user_input").length,
    localAiEnabled: input.localAiEnabled,
    currentPetName: input.currentPetName,
    currentPetState: input.currentPetState ? petStateLabels[input.currentPetState] : undefined,
  };
}

export function buildWorkEvents(input: {
  reminderEvents: ReminderEvent[];
  reminders: Reminder[];
  commandTasks: CommandTask[];
}): WorkEventItem[] {
  const reminderMap = new Map(input.reminders.map((reminder) => [reminder.id, reminder]));
  const events: WorkEventItem[] = [];

  input.reminderEvents.forEach((event) => {
    const reminder = reminderMap.get(event.reminderId);
    events.push({
      id: `reminder-${event.id}`,
      category: "reminder",
      title: reminder?.title ?? "提醒事件",
      detail: event.message ?? event.eventType,
      createdAt: event.createdAt,
    });
  });

  input.commandTasks.forEach((task) => {
    if (task.startedAt) {
      events.push({
        id: `command-start-${task.id}`,
        category: "command",
        title: `开始任务：${task.title}`,
        detail: task.adapterType,
        createdAt: task.startedAt,
      });
    }
    if (task.completedAt) {
      events.push({
        id: `command-end-${task.id}`,
        category: "command",
        title: `${task.status === "failed" ? "任务失败" : "任务完成"}：${task.title}`,
        detail: task.status,
        createdAt: task.completedAt,
      });
    }
    if (task.status === "needs_user_input") {
      events.push({
        id: `command-wait-${task.id}`,
        category: "command",
        title: `等待确认：${task.title}`,
        createdAt: task.updatedAt,
      });
    }
  });

  return events
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 30);
}

export function buildWorkSuggestions(overview: WorkStatusOverview): string[] {
  const suggestions: string[] = [];

  if (overview.ignoredReminders >= 2) {
    suggestions.push("你经常忽略提醒，可以考虑调整提醒频率或文案。");
  }
  if (overview.failedTasks >= 2) {
    suggestions.push("今天失败任务较多，建议先复盘日志再重试。");
  }
  if (overview.waitingConfirmCount > 0) {
    suggestions.push("当前有任务等待确认，建议打开任务监控页集中处理。");
  }
  if (overview.commandTasksRun >= 4 && overview.completedReminders === 0) {
    suggestions.push("今天你已经连续工作较久，可以安排一次休息。");
  }
  if (suggestions.length === 0) {
    suggestions.push("今天状态平稳，继续保持轻量节奏。");
  }

  return suggestions.slice(0, 3);
}
